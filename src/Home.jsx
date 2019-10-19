import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from './contentFiles';

function Home() {
  return (
    <header>
      {Object.keys(routes).map(route => <p key={route}><Link to={route}>{routes[route].displayTitle}</Link></p>)}
    </header>
  );
}

export default Home;
