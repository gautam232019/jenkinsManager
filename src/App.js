//Imports
import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateCredentials from './pages/CreateCredentials';
import GetCredentials from './pages/GetCredentials';
import UpdateCredentals from './pages/UpdateCredentials';
import CreatePod from './pages/CreatePod';
import GetPodTemplates from './pages/GetPodTemplates'

function App() {
  //Routes
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/getcredentials' component={GetCredentials} />
          <Route path='/createcredentials' component={CreateCredentials} />
          <Route path='/updatecredentials' component={UpdateCredentals} />
          <Route path='/createpod' component={CreatePod} />
          <Route path='/getpods' component={GetPodTemplates}/>
        </Switch>
      </Router>
    </>
  );
}

export default App;
