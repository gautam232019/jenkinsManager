//Imports
import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import data from './data.json'

const CreateCredentials = () => {
  //Variables
  const [scope, setScope] = useState('GLOBAL');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [id, setId] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [usernameSecret,setUsernameSecret] = useState(false)
  const [privateKey,setPrivateKey] = useState("")
  const [passphrase,setPassphrase] = useState("")
  const [secretText,setSecretText] = useState("")
  const [baseUrls,setBaseurls] = useState([]);
  const [keys,setKeys] = useState([]);
  const [users,setUsers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [usernameCheckbox,setUsernameCheckbox] = useState({
    option: false
  });

  const options = [];
  for(let i=0 ; i<baseUrls.length ; i++){
    options.push({ value: i, label: keys[i] });
  }
   
  
  const handleJenkinsOptionChange = (selected) => {
    setSelectedOptions(selected);
  };

  useEffect(() => {
         setBaseurls(data.data.urls);
         setUsers(data.data.users);
         setKeys(data.data.keys);
  }, []);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  
  const handleUsernameCheckboxChange = (event) => {
    const {name,checked} = event.target;
    setUsernameCheckbox(prevState => ({
      ...prevState,
      [name]: checked
    }))
    console.log(usernameCheckbox);
  }
  
  let handleSubmit = (event) => {
    event.preventDefault();
    if(selectedOptions.length == 0){
      toast("Please select atleast on jenkins!!")
    }
    else{
      for(let i=0 ; i< selectedOptions.length ; i++){
        let selectedNo = selectedOptions[i].value;
        createItem(event,baseUrls[selectedNo],process.env.REACT_APP_API_TOKEN,users[selectedNo]);
        }
    }
    // setIsLoading(false);
  }

  let createItem = async (event,url,user) => {
    event.preventDefault();
    //json for credential object
    let json;
    if(selectedOption == 'option1'){
      if(id == '' || username == '' || password == ''){
        toast("Please fill the necessary fields!")
        return;
      }
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
    }
    else if(selectedOption == 'option2'){
      if(id == '' || username == '' || usernameSecret == ''){
        toast("Please fill the necessary fields!")
        return;
      }
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
      if(id == '' || id == '' || secretText == ''){
        toast("Please fill the necessary fields!")
        return;
      }
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

    const config = {headers: {
      baseurl : url,
      username : user,
    }};
    await axios.post(`https://7s973mvv94.execute-api.us-east-2.amazonaws.com/createcredentials`,json,
    config)
      .then(() => {
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

  //Function for UI of create credentials form
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
  
  //UI for create credentials page
  return (
    <div className='createcredential'>
      <ToastContainer/>
       <div style={{marginLeft:'10%'}} className="select-jenkins">
          <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={handleJenkinsOptionChange}
          />
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
