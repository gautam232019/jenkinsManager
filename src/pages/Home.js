import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';


function Home() {

  const [url,setUrl] = useState('');
  const [user,setUser] = useState('');
  const [ssmkey,setSsmkey] = useState('');
  const [data,setData] = useState({});
  const [isVisible ,setIsVisible] = useState(false)
  
  const getData = async () => {
     await axios.get('http://localhost:3001/api/data')
     .then(response => {
      setData(response);
     })
     .catch(e => {
      console.log(e);
     })
  }

  useEffect(() => {
    getData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const info = data;
    if(url == '' || ssmkey == '' || user == ''){
      toast('Please fill all the values')
      console.log(data);
      return;
    }
    //update here

    info.data.data.urls.push(url)
    info.data.data.keys.push(ssmkey)
    info.data.data.users.push(user)
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    await axios.post('http://localhost:3001/api/data',info,config)
    .then(response => {
      toast({response})
    })
    .catch(error => {
      toast(error)
    })
  }

  const showForm = () => {
      setIsVisible(true);
  }

  return (
    <div className='home'>
      <ToastContainer/>
      <div style={{marginLeft:'17%'}}>
      {/* <div style={{marginRight:'12%',width:'90%',fontSize:'24px',fontFamily:'Raleway,"Open Sans",sans-serif',marginTop:'3%'}}>With this store we can manage our Credentials in multiple jenkins instances at once. It uses jenkins api for CRUD operations in it.<br/><br/></div> */}
      <header className="header">
        <h5 className="header__title">With this store we can manage our Credentials in multiple jenkins instances at once. It uses jenkins api for CRUD operations in it.<br/><br/></h5>
        <hr className="header__line" />
      <button type="submit" className='addJenkinsForm' style={{marginTop:'0px',fontSize:'14px'}} onClick={showForm}>ADD JENKINS</button>
      </header>
      { isVisible ?
        <form onSubmit={handleSubmit} style={{alignItems:'center',marginLeft:'5px',width:'300px'}}>
            <input
              type="text"
              value={url}
              onChange={event => setUrl(event.target.value)}
              placeholder="Url"
              className='addJenkinsForm'
            />
            <input
              type="ssmkey"
              value={ssmkey}
              onChange={event => setSsmkey(event.target.value)}
              placeholder="SSM Key"
              className='addJenkinsForm'
            />
            <input
              type="text"
              value={user}
              onChange={event => setUser(event.target.value)}
              placeholder="User"
              className='addJenkinsForm'
            />
              <button type="submit" className='addJenkinsForm'>ADD</button>
          </form> : <div></div>
           
          }
     </div>
    </div>
  );
}

export default Home;
