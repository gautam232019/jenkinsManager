import React, { useState,useEffect } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import data from './data.json'
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function  GetCredentials() {
  const history = useHistory();

  const [crumb, setCrumb] = useState('')
  const [items, setItems] = useState([]);
  const [selectall, setSelectall] = useState(false)
  const [showTable , setShowTable] = useState(false)
  const [baseUrls,setBaseurls] = useState([]);
  const [keys,setKeys] = useState([]);
  const [users,setUsers] = useState([]);
  
  const options = [];
  for(let i=0 ; i<baseUrls.length ; i++){
    options.push({ value: i, label: keys[i] });
  }
   
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const handleOptionChange = (selected) => {
    setSelectedOptions(selected);
  };
 
    // let obj = {};
    // for(let i=0 ; i<baseUrls.length ; i++){
    //     obj[`option${i+1}`] = false;
    // }
    // const [checkboxes, setCheckboxes] = useState(obj);


  // const handleCheckboxChange = (event) => {
  //   const { name, checked } = event.target;
  //   console.log(name);
  //   setCheckboxes(prevState => ({
  //     ...prevState,
  //     [name]: checked
  //   }));
  // };

  const getData = async () => {
    await axios.get(`${process.env.REACT_APP_URL}:3001/api/data`)
    .then(response => {
     console.log(response.data.data.urls);
     setBaseurls(response.data.data.urls);
     setUsers(response.data.data.users);
     setKeys(response.data.data.keys);
    })
  }
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
  // let customStr;
  const getCreds = (event) => {
    // console.log(selectedOptions[0].value);
      if(selectedOptions.length == 0){
        toast("Please select atleast one jenkins!!")
      }
      else{
        for(let i=0 ; i< selectedOptions.length ; i++){
          // customStr = `option${i+1}`;
          //  if(checkboxes[customStr]){
          //    getItems(event,baseUrls[i],keys[i],users[i]);
          //  }
          let selectedNo = selectedOptions[i].value;
          getItems(event,baseUrls[selectedNo],keys[selectedNo],users[selectedNo]);
         }
         setShowTable(true);
      }
  }
  let finalItems = [];
  let commonArray = [];

  const getItems = async (event,url,key,user) => {
    event.preventDefault();
    // const uniqueKey = await fetchKey(key);
    console.log(user);
    const auth =`${user}:${"8299b258f6d44eb99733e3c25e790992"}`
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
        // let uniqueArray = Array.from(new Set(finalItems.map(JSON.stringify)), JSON.parse);
        // console.log(response.data.credentials);
        commonArray = commonArray.filter((item) =>
          response.data.credentials.some((credItem) => credItem.id === item.id)
        );
        setItems(commonArray);
        // console.log(commonArray);
      })
      .catch(error => {
        console.error('Error retrieving items:', error);
        toast("Body not well formed!")
      });
  };

  const updateItem = (item) => {
    history.push({
    pathname: '/updatecredentials',
    state: item,
  });
  }

  return (
<div className="getcredential">
    <ToastContainer/>
    <div className="select-jenkins">
          {/* <label>Select Jenkins:</label>I */}
          <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={handleOptionChange}
          />
          {/* <div>
            Selected options:
            {selectedOptions.map((option) => (
              <span key={option.value}>{option.label}, </span>
            ))}
          </div> */}
          <button className="delete-btn" style={{backgroundColor:'#367b88',fontSize:'15px',fontWeight: 'bold',marginTop:'20px'}} onClick={getCreds}>
              Get Credentials
          </button>
    </div>
    {/* <div className="checkbox-container"> */}
      
      {/* <label className="checkbox-label">
        <input
          type="checkbox"
          name={`selectall`}
          checked={selectall}
          // onChange={handleCheckboxChange}
          // style={{marginLeft:'10px'}}
        />
        <span className="checkmark"></span>
        {`Select All`}
      </label> */}
      {/* {baseUrls.map((item,index) => (
      <label className="checkbox-label">
        <input
          type="checkbox"
          name={`option${index+1}`}
          checked={checkboxes[`option${index+1}`]}
          onChange={handleCheckboxChange}
          // style={{marginLeft:'10px'}}
        />
        <span className="checkmark"></span>
        {`Jenkins ${index+1}`}
      </label>
        ))} */}
      {/* <label className="checkbox-label">
        <input
          type="checkbox"
          name="option1"
          checked={checkboxes.option1}
          onChange={handleCheckboxChange}
          // style={{marginLeft:'10px'}}
        />
        <span className="checkmark" style={{marginLeft:'8px'}}></span>
        Jenkins 1
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="option2"
          checked={checkboxes.option2}
          onChange={handleCheckboxChange}
        />
        <span className="checkmark" style={{marginLeft:'8px'}}></span>
        Jenkins 2
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="option3"
          checked={checkboxes.option3}
          onChange={handleCheckboxChange}
        />
        <span className="checkmark" style={{marginLeft:'8px'}}></span>
        Jenkins 3
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="option4"
          // checked={selectAll}
          // onChange={handleSelectAllChange}
        />
        <span className="checkmark" style={{marginLeft:'8px'}}></span>
        Select All
      </label> */}
    {/* </div> */}
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
