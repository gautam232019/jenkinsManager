import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Select from 'react-select';

const CreatePod = () => {
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
    let [formVisible,setFormVisible] = useState(0);
    let [volumeFormVisible,setVolumeFormVisible] = useState(0);
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
    
    const options = [];
    for(let i=0 ; i<baseUrls.length ; i++){
        options.push({ value: i, label: `Jenkins ${i+1}` });
    }

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

    const showContainerForm = () => {
        setFormVisible(formVisible+1);
        // console.log(formVisible);
    }
    // console.log(volume);
    const renderVolumeForm = () => {
        console.log(volume);
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
    return (
        <div className='createpod'>
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
                        onClick={showContainerForm}
                    >Create Template</button>
                </form>
            </div>
        </div>
    )
}

export default CreatePod;