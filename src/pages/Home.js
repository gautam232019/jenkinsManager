//Imports
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

//Component
const Home = () => {
  return (
    <div className='home'>
      <ToastContainer/>
      <div style={{marginLeft:'17%'}}>
      <header className="header">
        <h5 className="header__title">With this store we can manage our Credentials in multiple jenkins instances at once. It uses jenkins api for CRUD operations in it.<br/><br/></h5>
        <hr className="header__line" />
      </header>
     </div>
    </div>
  );
}

export default Home;
