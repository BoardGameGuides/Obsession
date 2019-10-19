import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from './contentFiles';

function Home() {
  return (
    <header className="App-header">
      {Object.keys(routes).map(route => <p key={route}><Link to={route}>{routes[route].metadata.title}</Link></p>)}
    </header>
  );
}

export default Home;
