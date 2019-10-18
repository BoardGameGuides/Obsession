import React from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.svg';

function Home() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <p>
        <Link to="/guest/sara-forbes-bonetta">See Sara</Link>
      </p>
      <p>
        <Link to="/tile/barn">See Barn</Link>
      </p>
    </header>
  );
}

export default Home;
