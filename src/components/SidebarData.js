import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';

export const SidebarData = [
  {
    title: 'Home',
    path: '/',
    icon: <AiIcons.AiFillHome />,
    cName: 'nav-text'
  },
  {
    title: 'Manage Credentials',
    path: '',
    icon: <IoIcons.IoIosReturnRight/>,
    cName: 'static-text'
  },
  {
    title: 'Get Credentials',
    path: '/getcredentials',
    icon: <IoIcons.IoIosPaper />,
    cName: 'nav-text'
  },
  {
    title: 'Create Credentials',
    path: '/createcredentials',
    icon: <IoIcons.IoMdCreate/>,
    cName: 'nav-text'
  },
  {
    title: 'Manage Pod Templates',
    path: '',
    icon: <IoIcons.IoIosReturnRight/>,
    cName: 'static-text'
  },
  {
    title: 'Get Pod Templates',
    path: '/',
    icon: <IoIcons.IoIosPaper/>,
    cName: 'nav-text'
  },
  {
    title: 'Create Pod Templates',
    path: '/createpod',
    icon: <IoIcons.IoMdCreate/>,
    cName: 'nav-text'
  }
];
