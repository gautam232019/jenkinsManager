import React, { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { SidebarData } from './SidebarData';
import './Navbar.css';
import { IconContext } from 'react-icons';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [isSelected, setIsSelected] = useState('Home');

  const showSidebar = () => setSidebar(!sidebar);

  const selectedItem = (item) => {
    console.log(item);
    setIsSelected(item);
  }

  return (
    <>
      <IconContext.Provider value={{ color: '#262626' }}>
        <div className='navbar'>
          <img style={{marginLeft:'40px'}} src='https://uxweb.wgti.net/design-system/assets/images/logos/wg-logo-white.svg'/>
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
