import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import MdxPage from './MdxPage';
import ScrollToTop from './ScrollToTop';
import { routes } from './contentFiles';
import { index } from './searchIndex';

// @ts-ignore
window.index = index;

function App() {
  return (
    <div className="App">
      <Router>
        <ScrollToTop />
        <Switch>
          {Object.keys(routes).map(route => <Route exact path={route} key={route}><MdxPage route={route} /></Route>)}
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
