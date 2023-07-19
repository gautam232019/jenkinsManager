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
    // getData();
         setBaseurls(data.data.urls);
         setUsers(data.data.users);
         setKeys(data.data.keys);
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

  //global variables for item array
  let finalItems = [];
  let commonArray = [];

  const getItems = async (event,url,key,user) => {
    event.preventDefault();
    // const uniqueKey = await fetchKey(key);
    console.log(user);
    const auth =`${user}:${key}`
    const config = {
      headers: {
        Authorization: `Basic ${btoa(auth.toString())}`
      }
    }
    await axios.get(`${url}crumbIssuer/api/json`,config)
    .then(response => {
      console.log(response.data.crumb);
      setCrumb(response.data.crumb)
    })
    .catch(error => {
      toast("Jenkins server timeout!")
      return;
    })
    // console.log(crumb);
    config.headers['Jenkins-Crumb'] = crumb
    config.headers['Content-Type'] = 'application/json'
    
    // console.log(config);
    await axios.get(`${url}manage/credentials/store/system/domain/_/api/json?tree=credentials[id,description,typeName]`,config)
      .then(response => {
        if(finalItems.length == 0){
          finalItems = [...finalItems,...response.data.credentials];
          commonArray = finalItems;
        }
        commonArray = commonArray.filter((item) =>
          response.data.credentials.some((credItem) => credItem.id === item.id)
        );
        setItems(commonArray);
      })
      .catch(error => {
        console.error('Error retrieving items:', error);
        toast("Body not well formed!")
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
