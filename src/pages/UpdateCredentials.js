import React, { useState,useEffect } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import qs from 'qs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';


const UpdateCredentals = (props) => {
    const history = useHistory();
    
    let id,typeName,description,username;
    let state;

    if(props.location.state){
      id = props.location.state.id;
      typeName = props.location.state.typeName;
      description = props.location.state.description;
      username = props.location.state.username;
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
        username = state.username;
      }
    }

    // console.log(type);
    const [realid, setRealid] = useState(id)
    const [type, setType] = useState(typeName)
    const [scope, setScope] = useState('GLOBAL');
    const [crumb, setCrumb] = useState('')
    const [preusername, setPreUsername] = useState(username);
    const [password, setPassword] = useState('');
    const [predescription, setPreDescription] = useState(description);
    const [selectall, setSelectall] = useState(false)
    const [baseUrls,setBaseurls] = useState([]);
    const [keys,setKeys] = useState([]);
    const [users,setUsers] = useState([]);

    const options = [];
  for(let i=0 ; i<baseUrls.length ; i++){
    options.push({ value: i, label: keys[i] });
  }
   
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const handleJenkinsOptionChange = (selected) => {
    setSelectedOptions(selected);
  };
  
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
      // this.props.location ? this.props.location.state :  :
      getData();
    }, []);

    let preChoice = "";

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
    const [selectAll,setSelectAll] = useState(false)
    // const [isLoading,setIsLoading] = useState(false)
    
    // const baseUrls = ['http://3.135.18.230:8080/','http://3.128.203.238:8080/']
    // const keys = ['jenkin1','jenkin2'];
    // const users = ['manas','gautam'];

    let obj = {};
    for(let i=0 ; i<baseUrls.length ; i++){
        obj[`option${i+1}`] = false;
    }
    const [checkboxes, setCheckboxes] = useState(obj);
  
      const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        console.log(name);
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

      let updateItem = async (event,url,uniqueKey,user) => {
        event.preventDefault();
        let json;
        if(selectedOption == 'option1'){
          json = {
            "": "0",
            "credentials": {
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
        }
        else if(selectedOption == 'option2'){
          json = {
            "": "7",
            "credentials": {
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
        console.log(Item);
        await axios.post(`${url}manage/credentials/store/system/domain/_/credential/${realid}/updateSubmit`,qs.stringify(Item),
        config2)
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

      function timeout(delay) {
        console.log("heyy");
        return new Promise( res => setTimeout(res, delay) );
      }

      let customStr;
      let handleSubmit = async (event) => {
        event.preventDefault();
        // setIsLoading(true)
        for(let i=0 ; i< selectedOptions.length ; i++){
            let selectedNo = selectedOptions[i].value;
            updateItem(event,baseUrls[selectedNo],keys[selectedNo],users[selectedNo]);
        //  customStr = `option${i+1}`;
        //   if(checkboxes[customStr]){
        //     updateItem(event,baseUrls[i],keys[i],users[i]);
        //   }
        }
        history.goBack();
        // setIsLoading(false);
      }


      let custom;
      let handleDelete = async (event) => {
        event.preventDefault();
        // setIsLoading(true)
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
          await timeout(1000);
          history.goBack();
        }
        else{
          toast("Please select atleast one Jenkins!")
        }
        }
      }

      const deleteItem = async (event,url,key,user) => {
        const uniqueKey = await fetchKey(key);
        const auth =`${user}:${uniqueKey}`
        
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

        const config3 = {
          headers: {
            Authorization: `Basic ${btoa(auth.toString())}`,
            'Jenkins-Crumb': crumb
          }
        }
        axios.post(`${url}manage/credentials/store/system/domain/_/credential/${realid}/doDelete`,undefined,config3)
          .then(() => {
            // Item deleted successfully, refresh the list
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
            //   onChange={event => setRealid(event.target.value)}
              className='fixedFields'
              placeholder="Item id"
            />
            <input
              type="text"
              value={scope}
            //   onChange={event => setScope(event.target.value)}
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
            //   onChange={event => setRealid(event.target.value)}
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
            //   onChange={event => setRealid(event.target.value)}
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
          {/* <label>Select Jenkins:</label>I */}
          <Select
            isMulti
            options={options}
            value={selectedOptions}
            onChange={handleJenkinsOptionChange}
          />
          {/* <div>
            Selected options:
            {selectedOptions.map((option) => (
              <span key={option.value}>{option.label}, </span>
            ))}
          </div> */}
    </div>
            <div className="checkbox-container">
      {/* <h1>Checkbox Example</h1> */}
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
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="option4"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
        <span className="checkmark"></span>
        Select All
      </label> */}
      {/* <label className="checkbox-label">
        <input
          type="checkbox"
          name={`selectall`}
          checked={selectall}
          onChange={handleCheckboxChange}
          style={{marginLeft:'10px'}}
        />
        <span className="checkmark"></span>
        {`Select All`}
      </label> */}
      {/* {
        baseUrls.map((item,index) => (
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