//Imports
import React, { useState,useEffect } from 'react';
import axios from 'axios';
import data from './data.json'
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function  GetCredentials() {
  
  //Variables
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [showTable , setShowTable] = useState(false)
  const [baseUrls,setBaseurls] = useState([]);
  const [keys,setKeys] = useState([]);
  const [users,setUsers] = useState([]);
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

  //Used to get controller data when the page loads
  useEffect(() => {
         setBaseurls(data.data.urls);
         setUsers(data.data.users);
         setKeys(data.data.keys);
  }, []);
  
  //Functions to get pods from a controller
  const getPodTemplates = (event) => {
      if(selectedOptions.length == 0){
        toast("Please select atleast one jenkins!!")
      }
      else{
        for(let i=0 ; i< selectedOptions.length ; i++){
          let selectedNo = selectedOptions[i].value;
          getPod(event,baseUrls[selectedNo],users[selectedNo]);
         }
         setShowTable(true);
      }
  }
  
  //global variables for item array
  let finalItems = [];
  let commonArray = [];

  const getPod = async (event,url,user) => {
    event.preventDefault();

    const config = {headers: {
      'baseurl': url,
      'username':user
    }};

    //Api call
    await axios.post(`https://7s973mvv94.execute-api.us-east-2.amazonaws.com/query`,{},
    config)
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

//UI for getpods route
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
