import React from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.svg';
import { routes } from './contentFiles';

function Home() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      {Object.keys(routes).map(route => <p key={route}><Link to={route}>{routes[route].metadata.title}</Link></p>)}
    </header>
  );
}

export default Home;
