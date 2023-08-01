//Imports
import React, { useState,useEffect } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import data from './data.json'
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GetCredentials = () => {
  
  //Variables
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [showTable , setShowTable] = useState(false)
  const [baseUrls,setBaseurls] = useState([]);
  const [keys,setKeys] = useState([]);
  const [users,setUsers] = useState([]);
  const options = [];
  const [selectedOptions, setSelectedOptions] = useState([]);


    //Used to get controller data when the page loads
    useEffect(() => {
           setBaseurls(data.data.urls);
           setUsers(data.data.users);
           setKeys(data.data.keys);
    }, []);
  
  //Used for pushing values to select dropdown for controllers
  for(let i=0 ; i<baseUrls.length ; i++){
    options.push({ value: i, label: keys[i] });
  }
  
  //Function to handle option change
  const handleOptionChange = (selected) => {
    setSelectedOptions(selected);
  };
  
  //Functions to get credentials from a controller
  const getCreds = (event) => {
      if(selectedOptions.length == 0){
        toast("Please select atleast one jenkins!!")
      }
      else{
        for(let i=0 ; i< selectedOptions.length ; i++){
          let selectedNo = selectedOptions[i].value;
          getItems(event,baseUrls[selectedNo],users[selectedNo]);
         }
         setShowTable(true);
      }
  }

  //global variables for item's array
  let finalItems = [];
  let commonItems = [];

  //Function called in loop for each jenkins
  const getItems = async (event,url,user) => {
    event.preventDefault();

    const config ={
      headers: {
        baseUrl : `${url}`,
        username : `${user}`
      }
    }
    
    await axios.get(`https://7s973mvv94.execute-api.us-east-2.amazonaws.com/getcredentials`,config)
      .then(response => {
        if(finalItems.length == 0){
          finalItems = [...finalItems,...response.data.credentials];
          commonItems = finalItems;
        }
        commonItems = commonItems.filter((item) =>
          response.data.credentials.some((credItem) => credItem.id === item.id)
        );
        setItems(commonItems);
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
