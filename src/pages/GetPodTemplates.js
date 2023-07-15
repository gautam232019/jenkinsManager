//Imports
import React, { useState,useEffect } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import data from './data.json'
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {xml2js} from 'xml-js';

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
  const options = [];
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  //Used for pushing values to select dropdown for controllers
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
  const getCreds = (event) => {
      if(selectedOptions.length == 0){
        toast("Please select atleast one jenkins!!")
      }
      else{
        for(let i=0 ; i< selectedOptions.length ; i++){
          let selectedNo = selectedOptions[i].value;
          getItems(event,baseUrls[selectedNo],process.env.REACT_APP_API_TOKEN,users[selectedNo]);
         }
         setShowTable(true);
      }
  }
  
  function parseXmlToJson(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
    const rootElement = xmlDoc.documentElement;
    return parseElement(rootElement);
  }
  
  function parseElement(element) {
    const json = {};
  
    if (element.hasAttributes()) {
      const attributes = element.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        json[`@${attribute.name}`] = attribute.value;
      }
    }
  
    if (element.hasChildNodes()) {
      const childNodes = element.childNodes;
  
      for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i];
  
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          const tagName = childNode.tagName;
          const value = parseElement(childNode);
  
          if (childNode.hasChildNodes() && childNode.childNodes.length === 1 && childNode.firstChild.nodeType === Node.TEXT_NODE) {
            json[tagName] = childNode.firstChild.textContent.trim();
          } else {
            if (json.hasOwnProperty(tagName)) {
              if (!Array.isArray(json[tagName])) {
                json[tagName] = [json[tagName]];
              }
  
              json[tagName].push(value);
            } else {
              json[tagName] = value;
            }
          }
        }
      }
    }
  
    return json;
  }
  
  
  
  
  

  const getTagValue = (xmlString) => {
    let startIndex = xmlString.indexOf('h')-1;
    // console.log(xmlString.substring(startIndex));
    let json = parseXmlToJson(xmlString.substring(startIndex));
    // console.log(json.clouds);
    return JSON.parse(JSON.stringify(json),null,2);
  }

  //global variables for item array
  let finalItems = [];
  let commonArray = [];

  const getItems = async (event,url,key,user) => {
    event.preventDefault();
    // const uniqueKey = await fetchKey(key);
    // console.log(user);

    //script code for getting config.xml
    const script = "def configFile = new File(Jenkins.getInstance().getRootDir(), 'config.xml'); def configFileContent = configFile.text; return configFileContent";
    const Item = { 'script':  script}
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
    await axios.post(`${url}scriptText`,Item,
    config2)
      .then((response) => {
        const item = getTagValue(response.data);
        console.log(item);
        console.log(response.data);
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
            
            <button className="delete-btn" style={{backgroundColor:'#367b88',fontSize:'15px',fontWeight: 'bold',marginTop:'20px'}} onClick={getCreds}>
                Get Credentials
            </button>
      </div>
    {showTable ? 
      <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.description}</td>
                <td>{item.typeName}</td>
                <td>
                  {/* <button className="delete-btn" onClick={() => deleteItem(item.id)}>
                    Manage
                  </button> */}
                  <button className="delete-btn" style={{marginLeft:"5px",backgroundColor:'#367b88',fontSize:'15px'}} onClick={() => updateItem(item)}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
      </table> : <div></div>
  }
</div>
  );
}

export default GetCredentials;
