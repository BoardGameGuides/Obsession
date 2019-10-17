import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const content = {};
function importAll (r) {
  r.keys().forEach(key => content[key] = r(key));
}
importAll(require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/));

const routes = {};
for (const key of Object.keys(content)) {
  const route = key.replace(/^\.+/, '').replace(/\.mdx$/, '');
  console.log(route);
  routes[route] = content[key].default;
}
var Test = content[Object.keys(content)[0]].default;

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          {Object.keys(routes).map(route => <Route path={route} key={route}>{routes[route]}</Route>)}
          <Route path="/">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <p>
                <Link to="/guests/test">Test link</Link>
              </p>
            </header>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
