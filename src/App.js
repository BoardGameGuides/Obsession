import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import MdxPage from './MdxPage';
import ScrollToTop from './ScrollToTop';
import Template from './Template';
import Search from './Search';
import { routes } from './contentFiles';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Switch>
        {Object.keys(routes).map(route => <Route exact path={route} key={route}><Template route={route}><MdxPage route={route} /></Template></Route>)}
        <Route path="/search">
          <Template route="/"><Search /></Template>
        </Route>
        <Route path="/">
          <Template route="/"><Home /></Template>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
