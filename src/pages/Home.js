import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';


function Home() {

  const [url,setUrl] = useState('');
  const [user,setUser] = useState('');
  const [ssmkey,setSsmkey] = useState('');
  const [data,setData] = useState({});
  
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
  return (
    <div className='home'>
      <ToastContainer/>
      <h6 style={{marginLeft:'18%',marginRight:'12%',marginBottom:'3%'}}>With this store we can manage our Credentials in multiple jenkins instances at once. It uses jenkins api for CRUD operations in it.<br/><br/> Add your jenkins below!!</h6>
      <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={url}
              onChange={event => setUrl(event.target.value)}
              placeholder="Url"
            />
            <input
              type="ssmkey"
              value={ssmkey}
              onChange={event => setSsmkey(event.target.value)}
              placeholder="SSM Key"
            />
            <input
              type="text"
              value={user}
              onChange={event => setUser(event.target.value)}
              placeholder="User"
            />
              <button type="submit">Add Jenkins</button>
          </form>
    </div>
  );
}

export default Home;
