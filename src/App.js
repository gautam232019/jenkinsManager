import './awsConfig'
import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateCredentials from './pages/CreateCredentials';
import GetCredentials from './pages/GetCredentials';
import UpdateCredentals from './pages/UpdateCredentials';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/getcredentials' component={GetCredentials} />
          <Route path='/createcredentials' component={CreateCredentials} />
          <Route path='/updatecredentials' component={UpdateCredentals} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
