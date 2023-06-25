import React, { useState } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import qs from 'qs';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import data from './data.json'

function CreateCredentials() {
  const [scope, setScope] = useState('GLOBAL');
  const [crumb, setCrumb] = useState('')
  const [username, setUsername] = useState('gautam');
  const [password, setPassword] = useState('gautam123');
  const [description, setDescription] = useState('it is a dummy cred');
  const [id, setId] = useState('gautam1');
  const [selectedOption, setSelectedOption] = useState('');
  const [type,setType] = useState('');
  const [param,setParam] = useState()
  const [usernameSecret,setUsernameSecret] = useState(false)
  const [privateKey,setPrivateKey] = useState("")
  const [passphrase,setPassphrase] = useState("")
  const [secretText,setSecretText] = useState("")
  const [selectAll,setSelectAll] = useState(false)
  const [isLoading,setIsLoading] = useState(false)

  const baseUrls = data.data.urls;
  const keys = data.data.keys;
  const users = data.data.users;
  
  // console.log(baseUrls);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };
  
  const [checkboxes, setCheckboxes] = useState({
    option1: false,
    option2: false,
    option3: false
  });

  const [usernameCheckbox,setUsernameCheckbox] = useState({
    option: false
  });
  
  const handleUsernameCheckboxChange = (event) => {
    const {name,checked} = event.target;
    setUsernameCheckbox(prevState => ({
      ...prevState,
      [name]: checked
    }))
    console.log(usernameCheckbox);
  }

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    console.log(checkboxes);
    setCheckboxes(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleSelectAllChange = () => {
    const updatedCheckboxes = checkboxes.map((checkbox) => ({
      ...checkbox,
      checked: !selectAll
    }));
    setCheckboxes(updatedCheckboxes);
    console.log(checkboxes);
    setSelectAll(!selectAll);
  };

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
  let customStr;
  let handleSubmit = (event) => {
    event.preventDefault();
    
    for(let i=0 ; i< Object.keys(checkboxes).length-1 ; i++){
     customStr = `option${i+1}`;
      if(checkboxes[customStr]){
        createItem(event,baseUrls[i],keys[i],users[i]);
      }
    }
    setIsLoading(false);
  }

  let createItem = async (event,url,uniqueKey,user) => {
    event.preventDefault();
    let json;
    if(selectedOption == 'option1'){
      // setType("com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl");
      json = {
        "": "0",
        "credentials": {
          "scope": scope,
          "username": username,
          "usernameSecret": false,
          "password": password,
          "$redact": "password",
          "id": id,
          "description": description,
          "stapler-class": "com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl",
          "$class": "com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl"
        }
      }
      // console.log(param);
    }
    else if(selectedOption == 'option2'){
      // setType("com.cloudbees.jenkins.plugins.sshcredentials.impl.BasicSSHUserPrivateKey$DirectEntryPrivateKeySource");
      json = {
        "": "7",
        "credentials": {
          "scope": scope,
          "id": id,
          "description": description,
          "username": username,
          "usernameSecret": usernameSecret,
          "privateKeySource": {
            "value": "0",
            "privateKey": privateKey,
            "stapler-class": "com.cloudbees.jenkins.plugins.sshcredentials.impl.BasicSSHUserPrivateKey$DirectEntryPrivateKeySource",
            "$class": "com.cloudbees.jenkins.plugins.sshcredentials.impl.BasicSSHUserPrivateKey$DirectEntryPrivateKeySource"
          },
          "passphrase": passphrase,
          "$redact": "passphrase",
          "stapler-class": "com.cloudbees.jenkins.plugins.sshcredentials.impl.BasicSSHUserPrivateKey",
          "$class": "com.cloudbees.jenkins.plugins.sshcredentials.impl.BasicSSHUserPrivateKey"
        }
      }
    }
    else if(selectedOption == 'option3'){
      json = {
        "": "9",
        "credentials": {
          "scope": scope,
          "secret": secretText,
          "$redact": "secret",
          "id": id,
          "description": description,
          "stapler-class": "org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl",
          "$class": "org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl"
        }
      }
    }
    const key = await fetchKey(uniqueKey);
    const Item = { 'json':  JSON.stringify(json)}
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

    const config2 = {headers: {
      Authorization: `Basic ${btoa(auth.toString())}`,
      'Jenkins-Crumb': crumb,
      'Content-Type': 'application/x-www-form-urlencoded'
    }};
    await axios.post(`${url}manage/credentials/store/system/domain/_/createCredentials`,qs.stringify(Item),
    config2)
      .then(() => {
        // Item created successfully, refresh the list
        // getItems();
        setScope('');
        setUsername('');
        setPassword('');
        setDescription('');
        setId('');
        setSecretText('');
      })
      .catch(error => {
        console.error('Error creating item:', error);
      });
  };

  const renderFormFields = () => {
    if (selectedOption === 'option1') {
      return (
        <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={id}
          onChange={event => setId(event.target.value)}
          placeholder="Id"
        />
        <input
          type="text"
          value={scope}
          onChange={event => setScope(event.target.value)}
          placeholder="Scope"
        />
        <input
          type="text"
          value={username}
          onChange={event => setUsername(event.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="Password"
        />
        <input
          type="text"
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description"
        />
        <button type="submit">Add Credentials</button>
      </form>
      );
    } else if (selectedOption === 'option2') {
      return (
        <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={id}
          onChange={event => setId(event.target.value)}
          placeholder="Id"
        />
        <input
          type="text"
          value={scope}
          onChange={event => setScope(event.target.value)}
          placeholder="Scope"
        />
        <input
          type="text"
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description"
        />
        <input
          type="text"
          value={username}
          onChange={event => setUsername(event.target.value)}
          placeholder="Username"
        />
        <label className="checkbox-label" style={{width:"350px",justifyContent:'center',fontSize:'20px'}}>
        <input
          type="checkbox"
          name="option"
          checked={usernameCheckbox.option}
          onChange={handleUsernameCheckboxChange}
        />
        <span className="checkmark"></span>
        Treat Username as secret
      </label>
      <input
          type="text"
          value={privateKey}
          onChange={event => setPrivateKey(event.target.value)}
          placeholder="Private Key"
          style={{marginTop:"20px",height:"80px"}}
        />
        <input
          type="text"
          value={passphrase}
          onChange={event => setPassphrase(event.target.value)}
          placeholder="Passphrase"
        />
        <button type="submit">Add Credentials</button>
      </form>
      );
    } else if (selectedOption === 'option3') {
      return (
        <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={id}
          onChange={event => setId(event.target.value)}
          placeholder="Id"
        />
        <input
          type="text"
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description"
        />
        <input
          type="password"
          value={secretText}
          onChange={event => setSecretText(event.target.value)}
          placeholder="Secret Text"
        />
        <button type="submit">Add Credentials</button>
      </form>
      );
    }
    return null;
  };
  
  return (
    <div className='createcredential'>
       {isLoading && <div className="loading-bar"></div>}
       <div className="checkbox-container">
      {/* <h1>Checkbox Example</h1> */}
      {
        data.data.urls.map((item,index) => (
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
        ))}
      {/* <label className="checkbox-label">
        <input
          type="checkbox"
          name="option1"
          checked={checkboxes.option1}
          onChange={handleCheckboxChange}
          // style={{marginLeft:'10px'}}
        />
        <span className="checkmark"></span>
        Jenkin 1
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="option2"
          checked={checkboxes.option2}
          onChange={handleCheckboxChange}
        />
        <span className="checkmark"></span>
        Jenkin 2
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="option3"
          checked={checkboxes.option3}
          onChange={handleCheckboxChange}
        />
        <span className="checkmark"></span>
        Jenkin 3
      </label> */}
      {/* <label className="checkbox-label">
        <input
          type="checkbox"
          name="option4"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
        <span className="checkmark"></span>
        Select All
      </label> */}
    </div>
      <div style={{marginTop:'2%',width:'60%',alignItems:'center',display:'inline-block',marginLeft:'65px'}}>
        <div style={{marginLeft:'80px'}}>
          <label style={{ marginRight: '10px', fontSize: '18px', fontWeight: 'bold' }}>Kind:</label>
            <select  style={{
                              height: 'fit-content',
                              width: 'max-content',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              backgroundColor: '#fff',
                              color: '#333',
                              fontSize: '14px',
                            }} value={selectedOption} onChange={handleOptionChange}>
              <option value="">-- Select Kind--</option>
              <option value="option1">Username with Password</option>
              <option value="option2">SSH Username with Private Key</option>
              <option value="option3">Secret text</option>
            </select>
        </div>
        {renderFormFields()}
      </div>
    </div>
  );
}

export default CreateCredentials;
