import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SidebarData } from './SidebarData';
import './Navbar.css';
import { IconContext } from 'react-icons';
import { useEffect } from 'react';
import Logo from '../assets/Logo.png';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);

  const [isSelected, setIsSelected] = useState('');

 useEffect(() => {
  setIsSelected(localStorage.getItem('selectedOption') || 'Home');
  localStorage.removeItem('selectedOption');
 },[])

  const showSidebar = () => setSidebar(!sidebar);

  const selectedItem = (item) => {
    localStorage.setItem('selectedOption',item);
    setIsSelected(item);
  }

  return (
    <>
      <IconContext.Provider value={{ color: '#262626' }}>
        <div className='navbar'>
          <img style={{marginLeft:'40px'}} src={Logo}/>
          {/* <Link to='#' className='menu-bars'>
            <FaIcons.FaBars onClick={showSidebar} />
          </Link> */}
          <div  style={{fontSize:'24px',color:'#fafafa',marginLeft:'60px'}}>Jenkins Operational Center </div>
        </div>
        <nav className={'nav-menu active'}>
          <ul className='nav-menu-items' onClick={showSidebar}>
            {/* <li className='navbar-toggle'> */}
              {/* <Link to='#' className='menu-bars'> */}
                {/* <AiIcons.AiOutlineClose /> */}
              {/* </Link> */}
            {/* </li> */}
            {SidebarData.map((item, index) => {
              if(item.title === "Manage Credentials" || item.title === "Manage Pod Templates"){
                return(
                  <li key={index} className={`${item.cName}`} >
                    <div>
                    {item.icon}
                      <span>{item.title}</span>
                    </div>
                </li>
                )
              }
              const className = item.title === isSelected ? 'selected' : '';
              return (
                <li key={index} className={`${item.cName} ${className}`} onClick={() => selectedItem(item.title)} >
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
