//Imports
import React, { useState,useEffect } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import data from './data.json'
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function  GetCredentials() {
  
  //Variables
  const history = useHistory();
  const [crumb, setCrumb] = useState('')
  const [items, setItems] = useState([]);
  const [selectall, setSelectall] = useState(false)
  const [showTable , setShowTable] = useState(false)
  const [baseUrls,setBaseurls] = useState([]);
  const [keys,setKeys] = useState([]);
  const [users,setUsers] = useState([]);
  const [podData,setPodData] = useState();
  const options = [];
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  //Dropdown for controllers
  for(let i=0 ; i<baseUrls.length ; i++){
    options.push({ value: i, label: keys[i] });
  }
  
  //Function to handle option change
  const handleOptionChange = (selected) => {
    setSelectedOptions(selected);
  };

  //Function for getting controllers data on page load
  const getData = async () => {
    await axios.get(`${process.env.REACT_APP_URL}:3001/api/data`)
    .then(response => {
    //  console.log(response.data.data.urls);
     setBaseurls(response.data.data.urls);
     setUsers(response.data.data.users);
     setKeys(response.data.data.keys);
    })
  }

  //Used to get controller data when the page loads
  useEffect(() => {
    getData();
  }, []);
  
  async function fetchKey (param) {
    const ssm = new AWS.SSM();

    const params = {
      Name: param // Replace with the actual name of your SSM parameter
    };

    try {
      const response = await ssm.getParameter(params).promise();
      const parameterValue = await response.Parameter.Value;
      return parameterValue;
      // Do something with the parameter value in your React component
    } catch (error) {
      console.error('Error fetching SSM parameter:', error);
      throw error;
    }
  }
  
  //Functions to get credentials from a controller
  const getPodTemplates = (event) => {
      if(selectedOptions.length == 0){
        toast("Please select atleast one jenkins!!")
      }
      else{
        for(let i=0 ; i< selectedOptions.length ; i++){
          let selectedNo = selectedOptions[i].value;
          getPod(event,baseUrls[selectedNo],process.env.REACT_APP_API_TOKEN,users[selectedNo]);
         }
         setShowTable(true);
      }
  }
  
  //global variables for item array
  let finalItems = [];
  let commonArray = [];

  const getPod = async (event,url,key,user) => {
    event.preventDefault();
    // const uniqueKey = await fetchKey(key);

    
    const auth =`${user}:${key}`

    const config = {
      headers: {
        Authorization: `Basic ${btoa(auth.toString())}`
      }
    }

    await axios.get(`${url}crumbIssuer/api/json`,config)
    .then(response => {
      setCrumb(response.data.crumb)
    })

    const config2 = {headers: {
      Authorization: `Basic ${btoa(auth.toString())}`,
      'Jenkins-Crumb': crumb,
      'Content-Type': 'application/x-www-form-urlencoded'
    }};

    //script code for getting config.xml
    let query = `import jenkins.model.Jenkins
        import groovy.json.JsonBuilder
        def cloudsData = []
        Jenkins.instance.clouds.each { cloud ->
            if (cloud.class.simpleName == 'KubernetesCloud') {
                def cloudData = [:]
                cloudData.name = cloud.name
                cloudData.type = cloud.class.name
                cloudData.options = [:]
                cloudData.options.serverUrl = cloud.serverUrl
                cloudData.options.jenkinsUrl = cloud.jenkinsUrl
                cloudData.options.credentialsId = cloud.credentialsId
                cloudData.options.containerCap = cloud.containerCap
                cloudData.options.templates = []
                cloud.templates.each { template ->
                    def podTemplate = [:]
                    podTemplate.id = template.id
                    podTemplate.name = template.name
                    podTemplate.label = template.label
                    podTemplate.namespace = template.namespace
                    podTemplate.containerTemplates = []
                    template.containers.each { container ->
                        def containerData = [:]
                        containerData.name = container.name
                        containerData.image = container.image
                        containerData.args = container.args
                        containerData.command = container.command
                        containerData.resources = [:]
                        containerData.resources.cpu = container.resourceRequestCpu
                        containerData.resources.memory = container.resourceRequestMemory
                        // Add more container properties as needed
                        podTemplate.containerTemplates << containerData
                    }
                    podTemplate.volumes = []
                    template.volumes.each { volume ->
                        if (volume instanceof org.csanchez.jenkins.plugins.kubernetes.volumes.ConfigMapVolume ||
                                volume instanceof org.csanchez.jenkins.plugins.kubernetes.volumes.EmptyDirVolume) {
                            def volumeData = [:]
                            volumeData.class = volume.getClass().getName()
                            if (volume instanceof org.csanchez.jenkins.plugins.kubernetes.volumes.ConfigMapVolume) {
                                def configMapVolume = (org.csanchez.jenkins.plugins.kubernetes.volumes.ConfigMapVolume) volume
                                volumeData.name = configMapVolume.configMapName
                                volumeData.mountPath = configMapVolume.mountPath
                                volumeData.type = 'ConfigMap'
                                // Add more ConfigMap volume properties as needed
                            } else if (volume instanceof org.csanchez.jenkins.plugins.kubernetes.volumes.EmptyDirVolume) {
                                def emptyDirVolume = (org.csanchez.jenkins.plugins.kubernetes.volumes.EmptyDirVolume) volume
                                volumeData.name = emptyDirVolume.mountPath
                                volumeData.type = 'EmptyDir'
                                // Add more EmptyDir volume properties as needed
                            }
                            podTemplate.volumes << volumeData
                        }
                    }
                    podTemplate.nodeSelector = template.nodeSelector
                    podTemplate.serviceAccount = template.serviceAccount
                    podTemplate.privileged = template.privileged
                    // Add more pod template properties as needed
                    cloudData.options.templates << podTemplate
                }
                cloudsData << cloudData
            }
        }
        def json = new JsonBuilder(cloudsData)
        println(json.toPrettyString())
        ` 
    const Item = { 'script':  query}
    await axios.post(`${url}scriptText`,Item,
    config2)
      .then((response) => {
        console.log(response);
        if(finalItems.length == 0){
          finalItems = [...finalItems,...response.data[0].options.templates];
          commonArray = finalItems;
        }
        commonArray = commonArray.filter((item) =>
          response.data[0].options.templates.some((templateItem) => templateItem.name === item.name)
        );
        setItems(commonArray);
    })
      .catch(error => {
        console.error('Error creating item:', error);
      });
  };
  
  //Function is called when user wants to update a credential
  const updateItem = (item) => {
    history.push({
    pathname: '/updatecredentials',
    state: item,
  });
  }

//UI for getcredentials route
return (
  <div className="getcredential">
      <ToastContainer/>
      <div className="select-jenkins">
            <Select
              isMulti
              options={options}
              value={selectedOptions}
              onChange={handleOptionChange}
            />
            
            <button className="delete-btn" style={{backgroundColor:'#367b88',fontSize:'15px',fontWeight: 'bold',marginTop:'20px'}} onClick={getPodTemplates}>
                Get Templates
            </button>
      </div>
    {showTable ? 
      <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>LABEL</th>
            </tr>
          </thead>
          <tbody>
            {
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.label}</td>
              </tr>
            ))}
          </tbody>
      </table> : <div></div>
  }
</div>
  );
}

export default GetCredentials;
