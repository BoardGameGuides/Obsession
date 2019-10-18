import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import MdxPage from './MdxPage';
import { routes } from './contentFiles';
import { index } from './searchIndex';

window.index = index;

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          {Object.keys(routes).map(route => <Route exact path={route} key={route}><MdxPage route={route} /></Route>)}
          <Route path="/">
            <Home/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
