import React from 'react';
import ReactDOMServer from 'react-dom/server';
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

function domToText(element) {
  let text = '';

  for (let i = 0, len = element.childNodes.length; i < len; i++) {
    let child = element.childNodes[i];
    if (child.nodeType === 3) {
      // Text nodes
      text += ' ' + child.nodeValue;
    }
    if (child.childNodes.length > 0) {
      // Parent nodes
      text += domToText(child);
    }
  }

  return text.replace(/\s+/g, ' ');
}

const domParser = new DOMParser();
function plaintext(ReactComponent)
{
  const element = React.createElement(ReactComponent);
  const html = ReactDOMServer.renderToString(element);
  const doc = domParser.parseFromString(html, 'text/html');
  return domToText(doc);
}

const routes = {};
for (const key of Object.keys(content)) {
  const route = key.replace(/^\.+/, '').replace(/\.mdx$/, '');
  const Component = content[key].default;
  const text = plaintext(Component);
  routes[route] = { Component, text };
  console.log(route, text);
}

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          {Object.keys(routes).map(route => <Route exact path={route} key={route}>{routes[route].Component}</Route>)}
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
