//Imports
import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import data from './data.json'


const UpdateCredentals = (props) => {
    const history = useHistory();
    
    //Variables
    let id,typeName,description;
    let state;
    if(props.location.state){
      console.log(props.location.state);
      id = props.location.state.id;
      typeName = props.location.state.typeName;
      description = props.location.state.description;
      state = localStorage.getItem('state')
      if(state){
        localStorage.removeItem('state')
      }
      localStorage.setItem('state',JSON.stringify(props.location.state));
    }
    else{
      state = localStorage.getItem('state')
      if(state) {
        state = JSON.parse(state);
        id = state.id;
        typeName = state.typeName;
        description = state.description;
      }
    }
    const [realid, setRealid] = useState(id)
    const [type, setType] = useState(typeName)
    const [scope, setScope] = useState('GLOBAL');
    const [preusername, setPreUsername] = useState("");
    const [password, setPassword] = useState('');
    const [predescription, setPreDescription] = useState(description);
    const [baseUrls,setBaseurls] = useState([]);
    const [keys,setKeys] = useState([]);
    const [users,setUsers] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const options = [];
    let preChoice = "";
    //Prefilling of values in the form
    if(type == "Username with password"){
        preChoice = "option1";
    }
    else if(type == "SSH Username with private key"){
        preChoice = "option2";
    }
    else{
        preChoice = "option3";
    }
    const [selectedOption, setSelectedOption] = useState(preChoice);
    const [usernameSecret,setUsernameSecret] = useState(false)
    const [privateKey,setPrivateKey] = useState("")
    const [passphrase,setPassphrase] = useState("")
    const [secretText,setSecretText] = useState("")

    //Setting up controllers 
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

    let obj = {};
    for(let i=0 ; i<baseUrls.length ; i++){
        obj[`option${i+1}`] = false;
    }

      const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
      };

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

      //Various Functions for handling submit events
      let updateItem = async (event,url,user) => {
        event.preventDefault();
        let json;
        if(selectedOption == 'option1'){
          json = {
              "scope": scope,
              "username": preusername,
              "usernameSecret": false,
              "password": password,
              "$redact": "password",
              "id": realid,
              "description": predescription,
              "stapler-class": "com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl",
              "$class": "com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl"
            }
          }
        else if(selectedOption == 'option2'){
          json = {
              "scope": scope,
              "id": realid,
              "description": predescription,
              "username": preusername,
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
        else if(selectedOption == 'option3'){
          json = {
            "stapler-class": "org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl",
            "scope": "GLOBAL",
            "secret": secretText,
            "$redact": "secret",
            "id": realid,
            "description": predescription
          };
        }
        
        const config = {headers: {
          'baseurl':  url,
          'username': user,
          'realid':realid
        }};
        await axios.post(`https://7s973mvv94.execute-api.us-east-2.amazonaws.com/updatecredentials`,json,
        config)
          .then(() => {
            setScope('');
            setPreUsername('');
            setPassword('');
            setPreDescription('');
            setRealid('');
            setSecretText('');
          })
          .catch(error => {
            console.error('Error creating item:', error);
          });
      };

      let handleSubmit = async (event) => {
        event.preventDefault();
        for(let i=0 ; i< selectedOptions.length ; i++){
            let selectedNo = selectedOptions[i].value;
            updateItem(event,baseUrls[selectedNo],users[selectedNo]);
        }
        history.goBack();
      }

      let handleDelete = async (event) => {
        event.preventDefault();
        const confirmDelete = window.confirm('Are you sure you want to delete?');
        if (confirmDelete) {
        let counter = 0;
        for(let i=0 ; i< selectedOptions.length ; i++){
            let selectedNo = selectedOptions[i].value;
            counter = 1;
            deleteItem(event,baseUrls[selectedNo],keys[selectedNo],users[selectedNo]);
        }
        if(counter == 1){
          toast("Deleted Succesfully")
          history.goBack();
        }
        else{
          toast("Please select atleast one Jenkins!")
        }
        }
      }

      const deleteItem = async (event,url,key,user) => {

        const config = {
          headers: {
            baseUrl : `${url}`,
            username : `${user}`,
            realid : `${realid}`
          }
        }
        axios.post(`https://7s973mvv94.execute-api.us-east-2.amazonaws.com/deletecredential`,undefined,config)
          .then(() => {
            toast("Deleted Succesfully",{type:'success'})
          })
          .catch(error => {
            console.error('Error deleting item:', error);
          });
      };

    const renderFormFields = () => {
        if (type == 'Username with password') {
          return (
            <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={realid}
              className='fixedFields'
              placeholder="Item id"
            />
            <input
              type="text"
              value={scope}
              className='fixedFields'
              placeholder="Item scope"
            />
            <input
              type="text"
              value={preusername}
              onChange={event => setPreUsername(event.target.value)}
              placeholder="Item username"
            />
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Item password"
            />
            <input
              type="text"
              value={predescription}
              onChange={event => setPreDescription(event.target.value)}
              placeholder="Item description"
            />
            <div style={{display:'flex',gap:'10px'}}>
              <button type="submit">Update Credentials</button>
              <button className="delete-btn" style={{marginTop:'10%',fontWeight:'normal',fontSize:'20px',backgroundColor:'red'}} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </form>
          );
        } else if (type == 'SSH Username with private key') {
          return (
            <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={realid}
              className='fixedFields'
              placeholder="Item id"
            />
            <input
              type="text"
              value={scope}
              onChange={event => setScope(event.target.value)}
              className='fixedFields'
              placeholder="Item scope"
            />
            <input
              type="text"
              value={predescription}
              onChange={event => setPreDescription(event.target.value)}
              placeholder="Item description"
            />
            <input
              type="text"
              value={preusername}
              onChange={event => setPreUsername(event.target.value)}
              placeholder="Item username"
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
              placeholder="Enter Private Key"
              style={{marginTop:"20px",height:"80px"}}
            />
            <input
              type="text"
              value={passphrase}
              onChange={event => setPassphrase(event.target.value)}
              placeholder="Passphrase"
            />
            <div style={{display:'flex',gap:'10px'}}>
            <button type="submit">Update Credentials</button>
            <button className="delete-btn" style={{marginTop:'10%',fontWeight:'normal',fontSize:'20px',backgroundColor:'red'}} onClick={handleDelete}>
              Delete
            </button>
            </div>
          </form>
          );
        } else if (type == 'Secret text') {
          return (
            <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={realid}
              className='fixedFields'
              placeholder="Item id"
            />
            <input
              type="text"
              value={predescription}
              onChange={event => setPreDescription(event.target.value)}
              placeholder="Item description"
            />
            <input
              type="password"
              value={secretText}
              onChange={event => setSecretText(event.target.value)}
              placeholder="Secret Text"
            />
            <div style={{display:'flex',gap:'10px'}}>
            <button type="submit" style={{padding:'5px 15px'}}>Update Credentials</button>
            <button className="delete-btn" style={{marginLeft:'20px',padding:'5px 50px',marginTop:'10%',fontWeight:'normal',fontSize:'18px',backgroundColor:'red'}} onClick={handleDelete}>
              Delete
            </button>
            </div>
          </form>
          );
        }
        return null;
      };
      

    return (
        <div className='createcredential'>
            <ToastContainer/>
            <div style={{marginLeft:'8%'}} className="select-jenkins">
          <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={handleJenkinsOptionChange}
          />
          
    </div>
            <div className="checkbox-container">
    </div>
      <div style={{marginTop:'2%',width:'60%',alignItems:'center',display:'inline-block',marginLeft:'10%'}}>
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
              <option value="option1">Username with password</option>
              <option value="option2">SSH Username with private key</option>
              <option value="option3">Secret text</option>
            </select>
        </div>
        {renderFormFields()}
      </div>
        </div>
    )
}

export default UpdateCredentals;