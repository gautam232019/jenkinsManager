//Imports
import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import data from '../pages/data.json'

const CreatePod = () => {
    //Variables
    const [name,setName] = useState('')
    const [baseUrls,setBaseurls] = useState([]);
    const [namespace,setNamespace] = useState('');
    const [label,setLabel] = useState('')
    const [keys,setKeys] = useState([]);
    const [users,setUsers] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [usage,setUsage] = useState([])
    const [volume,setVolume] = useState('')
    const [yamlMerge,setYamlMerge] = useState('')
    const [containerName,setContainerName] = useState('');
    let   [formVisible,setFormVisible] = useState(0);
    const [dockerImage,setDockerImage] = useState('');
    const [wdir,setWdir] = useState('');
    const [command,setCommand] = useState('');
    const [argument,setArgument] = useState('')
    const [configMapName,setConfigMapName] = useState("")
    const [mountPath,setMountPath] = useState("")
    const [ttyCheckbox,setTtyCheckbox] = useState({
        option: false
      });
    const [inMemory,setInMemory] = useState({
        option: false
    })
    
    
    let handleSubmit = (event) => {
        event.preventDefault();
        if(selectedOptions.length == 0){
          toast("Please select atleast on jenkins!!")
        }
        else{
          for(let i=0 ; i< selectedOptions.length ; i++){
            let selectedNo = selectedOptions[i].value;
            createPod(event,baseUrls[selectedNo],users[selectedNo]);
            }
        }
        // setIsLoading(false);
      }
    
      let createPod = async (event,url,user) => {
        event.preventDefault();
  
        const config = {headers: {
          'baseurl': url,
          'username':user
        }};
      
        //Api call with global variables
        let queryResult;
        let templateLength;
        await axios.post(`https://7s973mvv94.execute-api.us-east-2.amazonaws.com/query`,{},
        config)
          .then((response) => {
            console.log(response.data[0].name);
            queryResult = response.data[0];
            templateLength = response.data[0].options.templates.length;
          })
          .catch(error => {
            console.error('Error getting query:', error);
          });

          //Json object for pod
          let json = {
            "cloud": {
              "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.KubernetesCloud",
              "$class": "org.csanchez.jenkins.plugins.kubernetes.KubernetesCloud",
              "name": queryResult.name,
              "serverUrl": queryResult.options.serverUrl,
              "useJenkinsProxy": false,
              "serverCertificate": "",
              "skipTlsVerify": false,
              "namespace": "",
              "jnlpregistry": "",
              "includeUser": "false",
              "credentialsId": "",
              "webSocket": false,
              "directConnection": false,
              "jenkinsUrl": queryResult.options.jenkinsUrl,
              "jenkinsTunnel": "",
              "connectTimeout": "5",
              "readTimeout": "15",
              "containerCapStr": "10",
              "podLabels": {
                "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.PodLabel",
                "$class": "org.csanchez.jenkins.plugins.kubernetes.PodLabel",
                "key": "jenkins",
                "value": "slave"
              },
              "": "1",
              "podRetention": {
                "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.pod.retention.Never",
                "$class": "org.csanchez.jenkins.plugins.kubernetes.pod.retention.Never"
              },
              "maxRequestsPerHostStr": "32",
              "waitForPodSec": "600",
              "retentionTimeout": "5",
              "addMasterProxyEnvVars": false,
              "usageRestricted": false,
              "defaultsProviderTemplate": "",
              "templates": [
                
              ]
            }
        };

        //Recreating old pod templates object
        for(let i=0 ; i<templateLength ; i++){
          let containerLength = queryResult.options.templates[i].containerTemplates.length;
          let volumeLength = queryResult.options.templates[i].volumes.length;
          let template = {
            "id": queryResult.options.templates[i].id,
            "name": queryResult.options.templates[i].name,
            "namespace": "",
            "label": queryResult.options.templates[i].label,
            "nodeUsageMode": "EXCLUSIVE",
            "inheritFrom": "",
            "containers": [],
            "volumes": [],
            "instanceCapStr": "",
            "": [
              "1",
              "1",
              "1"
            ],
            "podRetention": {
              "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.pod.retention.Default",
              "$class": "org.csanchez.jenkins.plugins.kubernetes.pod.retention.Default"
            },
            "idleMinutesStr": "",
            "activeDeadlineSecondsStr": "",
            "slaveConnectTimeoutStr": "100",
            "yaml": "",
            "yamlMergeStrategy": {
              "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.pod.yaml.Overrides",
              "$class": "org.csanchez.jenkins.plugins.kubernetes.pod.yaml.Overrides"
            },
            "showRawYaml": true,
            "serviceAccount": "",
            "runAsUser": "",
            "runAsGroup": "",
            "supplementalGroups": "",
            "hostNetwork": false,
            "nodeSelector": queryResult.options.templates[i].nodeSelector,
            "workspaceVolume": {
              "memory": false,
              "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.volumes.workspace.EmptyDirWorkspaceVolume",
              "$class": "org.csanchez.jenkins.plugins.kubernetes.volumes.workspace.EmptyDirWorkspaceVolume"
            },
            "nodeProperties": {
              "stapler-class-bag": "true"
            }
          }
          json.cloud.templates.push(template);
          for(let j=0 ; j<containerLength ; j++){
              let container = {
                "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.ContainerTemplate",
                "$class": "org.csanchez.jenkins.plugins.kubernetes.ContainerTemplate",
                "name": queryResult.options.templates[i].containerTemplates[j].name,
                "image": queryResult.options.templates[i].containerTemplates[j].image,
                "alwaysPullImage": false,
                "workingDir": "/home/jenkins/agent",
                "command": queryResult.options.templates[i].containerTemplates[j].command,
                "args": queryResult.options.templates[i].containerTemplates[j].args,
                "ttyEnabled": true,
                "privileged": false,
                "runAsUser": "",
                "runAsGroup": "",
                "resourceRequestCpu": "",
                "resourceRequestMemory": "",
                "resourceRequestEphemeralStorage": "",
                "resourceLimitCpu": "",
                "resourceLimitMemory": "",
                "resourceLimitEphemeralStorage": "",
                "livenessProbe": {
                  "execArgs": "",
                  "initialDelaySeconds": "0",
                  "timeoutSeconds": "0",
                  "failureThreshold": "0",
                  "periodSeconds": "0",
                  "successThreshold": "0"
                }
              }
              json.cloud.templates[i].containers.push(container);
          }
          for(let k=0 ; k<volumeLength ; k++){
            let volume = {
              "stapler-class": queryResult.options.templates[i].volumes[k].class,
              "$class": queryResult.options.templates[i].volumes[k].class,
              "configMapName": queryResult.options.templates[i].volumes[k].name,
              "mountPath": queryResult.options.templates[i].volumes[k].mountPath,
              "subPath": "",
              "optional": false
            }
            json.cloud.templates[i].volumes.push(volume);
          }
        }

        //add new template to the json object
        if(name == "" || namespace == "" || label == ""){
          toast("Please fill all the values!")
          return;
        }
        let newTemplate = {
          "id": "",
          "name": name,
          "namespace": namespace,
          "label": label,
          "nodeUsageMode": "EXCLUSIVE",
          "inheritFrom": "",
          "containers": [],
          "volumes": [],
          "instanceCapStr": "",
          "": [
            "1",
            "1",
            "1"
          ],
          "podRetention": {
            "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.pod.retention.Default",
            "$class": "org.csanchez.jenkins.plugins.kubernetes.pod.retention.Default"
          },
          "idleMinutesStr": "",
          "activeDeadlineSecondsStr": "",
          "slaveConnectTimeoutStr": "100",
          "yaml": "",
          "yamlMergeStrategy": {
            "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.pod.yaml.Overrides",
            "$class": "org.csanchez.jenkins.plugins.kubernetes.pod.yaml.Overrides"
          },
          "showRawYaml": true,
          "serviceAccount": "",
          "runAsUser": "",
          "runAsGroup": "",
          "supplementalGroups": "",
          "hostNetwork": false,
          "nodeSelector": "",
          "workspaceVolume": {
            "memory": false,
            "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.volumes.workspace.EmptyDirWorkspaceVolume",
            "$class": "org.csanchez.jenkins.plugins.kubernetes.volumes.workspace.EmptyDirWorkspaceVolume"
          },
          "nodeProperties": {
            "stapler-class-bag": "true"
          }
        }
        json.cloud.templates.push(newTemplate);
        if(containerName == "" || dockerImage == ""){
          toast("Please fill all the values!")
          return;
        }
        let newContainer = {
          "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.ContainerTemplate",
          "$class": "org.csanchez.jenkins.plugins.kubernetes.ContainerTemplate",
          "name": containerName,
          "image": dockerImage,
          "alwaysPullImage": false,
          "workingDir": "/home/jenkins/agent",
          "command": command,
          "args": argument,
          "ttyEnabled": true,
          "privileged": false,
          "runAsUser": "",
          "runAsGroup": "",
          "resourceRequestCpu": "",
          "resourceRequestMemory": "",
          "resourceRequestEphemeralStorage": "",
          "resourceLimitCpu": "",
          "resourceLimitMemory": "",
          "resourceLimitEphemeralStorage": "",
          "livenessProbe": {
            "execArgs": "",
            "initialDelaySeconds": "0",
            "timeoutSeconds": "0",
            "failureThreshold": "0",
            "periodSeconds": "0",
            "successThreshold": "0"
          }
        }
        json.cloud.templates[json.cloud.templates.length-1].containers.push(newContainer)
        
        let newVolume;
        if(volume.value == "Config Map Volume") {
          if(configMapName == "" || mountPath == ""){
            toast("Please fill volume details!")
            return;
          }
          newVolume = {
            "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.volumes.ConfigMapVolume",
            "$class": "org.csanchez.jenkins.plugins.kubernetes.volumes.ConfigMapVolume",
            "configMapName": configMapName,
            "mountPath": mountPath,
            "subPath": "",
            "optional": false
          }
        }
        else{
          if(mountPath == ""){
            toast("Please fill volume details!")
            return;
          }
          newVolume = {
            "stapler-class": "org.csanchez.jenkins.plugins.kubernetes.volumes.EmptyDirVolume",
            "$class": "org.csanchez.jenkins.plugins.kubernetes.volumes.EmptyDirVolume",
            "mountPath": mountPath
          }
        }
        json.cloud.templates[json.cloud.templates.length-1].volumes.push(newVolume)
        console.log(json);

        //Api call for creating pod
        await axios.post(`https://7s973mvv94.execute-api.us-east-2.amazonaws.com/createpods`,json,config)
        .then(response => {
            console.log(response);
            toast("Succesfully created pod template!")
        })
        .catch(error => {
            console.log(error);
        })
      };

    //Handle Change event for checkboxes used in the pod template form 
    const handleTtyCheckboxChange = (event) => {
        const {name,checked} = event.target;
        setTtyCheckbox(prevState => ({
          ...prevState,
          [name]: checked
        }))
        console.log(ttyCheckbox);
    }

    const handleInMemoryCheckboxChange = (event) => {
        const {name,checked} = event.target;
        setInMemory(prevState => ({
          ...prevState,
          [name]: checked
        }))
    }

    const handleJenkinsOptionChange = (selected) => {
        setSelectedOptions(selected);
      };

    const handleUsageChange = (selected) => {
        setUsage(selected)
    }

    const handleVolumeChange = (selected) => {
        setVolume(selected)
    }

    const handleYamlMergeChange = (selected) => { 
        setYamlMerge(selected)
    }
    
    //Setting options for jenkins controller
    const options = [];
    for(let i=0 ; i<baseUrls.length ; i++){
        options.push({ value: i, label: keys[i] });
    }

    //Setting up options for all checkboxes
    const usageOptions = [];
    usageOptions.push({
      value: "Only build jobs with label expressions matching this node",
      label:"Only build jobs with label expressions matching this node"  
    })

    const volumeOptions = [];
    volumeOptions.push({
        value: "Config Map Volume",
        label: "Config Map Volume"
    })

    volumeOptions.push({
        value: "Empty Dir Volume",
        label: "Empty Dir Volume"
    })

    const yamlMergeOptions = [];
    yamlMergeOptions.push({
        value: "Override",
        label: "Override"
    })

    yamlMergeOptions.push({
        value: "Merge",
        label: "Merge"
    })

      useEffect(() => {
         setBaseurls(data.data.urls);
         setUsers(data.data.users);
         setKeys(data.data.keys);
      }, []);

    //Visibility handlers
    const showContainerForm = () => {
        setFormVisible(formVisible+1);
    }
  
    const renderVolumeForm = () => {
        // console.log(volume);
        if(volume.value == "Empty Dir Volume"){
            return (
                <div>
                <label className="checkbox-label" style={{width:"180px",marginBottom:'20px',marginTop:'20px',justifyContent:'center',fontSize:'15px',fontWeight:'normal'}}>
                            <input
                                type="checkbox"
                                name="option"
                                checked={inMemory.option}
                                onChange={handleInMemoryCheckboxChange}
                            />
                            <span className="checkmark"></span>
                            In Memory
                            </label>
                <input
                    type="text"
                    value={mountPath}
                    onChange={event => setMountPath(event.target.value)}
                    placeholder='Mount Path'
                />
                </div>  
            )
        }
        else if(volume.value == "Config Map Volume"){
            return(
                <div>
                    <input
                        type="text"
                        value={configMapName}
                        onChange={event => setConfigMapName(event.target.value)}
                        placeholder='Config Map Name'
                    />
                    <input
                        type="text"
                        value={mountPath}
                        onChange={event => setMountPath(event.target.value)}
                        placeholder='Mount Path'
                    />
                </div>
            )
        }
    }
    const renderForm = () => {
       const containers = [];

       for(let i=0 ; i<formVisible ; i++){
        //container element will be here
        containers.push(<div key={i} style={{borderStyle:'dashed',borderColor:'grey',width:'fit-content',padding:'50px',borderRadius:'20px',marginTop:'20px'}}>
                            <input
                                type="text"
                                value={containerName}
                                onChange={event => setContainerName(event.target.value)}
                                placeholder='Name'
                            />
                            <input
                                type="text"
                                value={dockerImage}
                                onChange={event => setDockerImage(event.target.value)}
                                placeholder='Docker Image'
                            />
                            <input
                                type="text"
                                value={wdir}
                                onChange={event => setWdir(event.target.value)}
                                placeholder='Working Directory'
                            />
                            <input
                                type="text"
                                value={command}
                                onChange={event => setCommand(event.target.value)}
                                placeholder='Command to run'
                            />
                            <input
                                type="text"
                                value={argument}
                                onChange={event => setArgument(event.target.value)}
                                placeholder='Argument to pass'
                            />
                            <label className="checkbox-label" style={{width:"250px",marginBottom:'20px',marginTop:'20px',justifyContent:'center',fontSize:'15px',fontWeight:'normal'}}>
                            <input
                                type="checkbox"
                                name="option"
                                checked={ttyCheckbox.option}
                                onChange={handleTtyCheckboxChange}
                            />
                            <span className="checkmark"></span>
                            Allocate Pseudo-TTY
                            </label>
                            {/* <div style={{display:'flex',flexDirection:'column'}}>
                                <label style={{marginBottom:'30px',marginTop:'20px',fontSize:'15px'}}>Environment Variables</label>
                                <button
                                    type='button'
                                    style={{width:'200px',marginTop:'10px'}}
                                >Add Environment Variables</button>
                            </div> */}
                        </div>)
       }
       return containers
    }

    //UI for create pod template screen
    return (
        <div className='createpod'>
          <ToastContainer/>
            <div className="select-jenkins">
                <Select
                    isMulti
                    options={options}
                    value={selectedOptions}
                    onChange={handleJenkinsOptionChange}
                    placeholder="Select Jenkins..."
                />
           </div>
            <div style={{marginLeft:'27%',marginTop:'50px',fontWeight:'bold',fontSize:'18px'}}>
                <form style={{marginTop:'0px'}}>
                    <label style={{marginBottom:'30px'}}>Pod Template</label>
                    <input
                        type="text"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        placeholder='Name'
                    />
                    <label style={{marginBottom:'10px',marginTop:'20px',fontSize:'15px'}}>Template Details</label>
                    <input
                        type="text"
                        value={namespace}
                        onChange={event => setNamespace(event.target.value)}
                        placeholder='Namespace'
                    />
                    <input
                        type="text"
                        value={label}
                        onChange={event => setLabel(event.target.value)}
                        placeholder='Labels'
                    />
                    <div style={{width:'600px',fontSize:'15px',fontWeight:'normal',border:'1px solid #262626',borderRadius:'5px'}}>
                    <Select
                      options={usageOptions}
                      value={usage}
                      placeholder="Usage"
                      onChange={handleUsageChange}
                    />
                    </div>
                    <label style={{marginTop:'40px',fontSize:'15px'}}>Containers</label>
                    <div style={{marginTop:'10px'}}>{renderForm()}</div>
                    <button
                        type='button'
                        style={{width:'200px',marginTop:'10px'}}
                        onClick={showContainerForm}
                    >Add Container</button>
                    <label style={{marginTop:'40px',fontSize:'15px',marginBottom:'20px'}}>Volume</label>
                    <div style={{width:'600px',fontSize:'15px',fontWeight:'normal',border:'1px solid #262626',borderRadius:'5px'}}>
                    <Select
                        options={volumeOptions}
                        value={volume}
                        placeholder="Add Volume"
                        onChange={handleVolumeChange}
                    /> 
                    </div>
                    <div style={{marginTop:'10px'}}>{renderVolumeForm()}</div>
                    <div style={{width:'600px',fontSize:'15px',fontWeight:'normal',border:'1px solid #262626',borderRadius:'5px',marginBottom:'10px'}}>
                    <Select
                        options={yamlMergeOptions}
                        value={yamlMerge}
                        placeholder="Yaml Merge Strategy"
                        onChange={handleYamlMergeChange}
                    />
                    </div>
                    <button
                        type='button'
                        style={{width:'200px',marginBottom:'50px'}}
                        onClick={handleSubmit}
                    >Create Template</button>
                </form>
            </div>
        </div>
    )
}

export default CreatePod;