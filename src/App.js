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
  r.keys().forEach(key => {
    const route = key.replace(/^\.+/, '').replace(/\.mdx$/, '');
    const contentModule = r(key);
    content[route] = {
      route,
      Component: contentModule.default
    };
  });
}
importAll(require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/));

// TODO: use htmlparser2 and build the index offline during production builds. Only build the index in the browser on dev builds.
if (process.env.NODE_ENV !== 'production') {
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

  for (const route of Object.keys(content)) {
    content[route].text = plaintext(content[route].Component);
    console.log(route, content[route].text);
  }
}

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          {Object.keys(content).map(route => <Route exact path={route} key={route}>{content[route].Component}</Route>)}
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
