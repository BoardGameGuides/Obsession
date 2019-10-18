import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MDXProvider } from '@mdx-js/react';
import { Builder } from 'lunr';
import logo from './logo.svg';
import './App.css';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function importAll2(r) {
  const result = {};
  r.keys().forEach(key => result[key] = r(key));
  return result;
}
console.log(importAll2(require.context('./content/', true, /\.(jpg|png)$/)));

const content = {};
function importAll(r) {
  r.keys().forEach(key => {
    const route = key.replace(/^\.+/, '').replace(/\.mdx$/, '');
    const contentModule = r(key);
    content[route] = {
      key,
      route,
      Component: contentModule.default,
      metadata: contentModule.frontMatter
    };
  });
}
importAll(require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/));

// TODO: use htmlparser2 and build the index offline during production builds. Only build the index in the browser on dev builds.
// TODO: make HTML parsing more intelligent: treat <h1> as the title and boost, maybe ignore other headers?
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
        text += ' ' + domToText(child);
      }
    }

    return text.replace(/\s+/g, ' ').trim();
  }

  const domParser = new DOMParser();
  function plaintext(ReactComponent)
  {
    const element = React.createElement(ReactComponent);
    const html = ReactDOMServer.renderToString(element);
    const doc = domParser.parseFromString(html, 'text/html');
    return domToText(doc);
  }

  const builder = new Builder();
  builder.field('title');
  builder.field('text');

  // TODO: auto-add fields found in metadata as space-delimited exact-match tokens.
  builder.field('type');
  builder.field('category');
  // builder.field('vp'); // <number> - the VP value of the card
  // builder.field('casual'); // 'true' or 'false' - whether a guest is a casual guest
  // builder.field('starter'); // 'true' or 'false' - whether a guest is a starter guest
  for (const route of Object.keys(content)) {
    const doc = Object.assign(content[route].metadata, {
      id: route,
      text: plaintext(content[route].Component),
      type: route.startsWith('/guests') ? 'guest' : 'tile'
    });
    console.log(doc);
    builder.add(doc);
  }
  window.index = builder.build();
}

function convertPath(route, path) {
  console.log(route, content[route].key, path);
  console.log(URI(path).absoluteTo(content[route].key));
}

function MyImage(route) {
  console.log(route);
  return function (props) {
    convertPath(route, props.src);
    return <p>Hi!</p>;
  };
}

function getComponents(route) {
  return {
    img: MyImage(route)
  };
}

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          {Object.keys(content).map(route => <Route exact path={route} key={route}><MDXProvider components={getComponents(route)}>{React.createElement(content[route].Component)}</MDXProvider></Route>)}
          <Route path="/">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <p>
                <Link to="/guests/sara-forbes-bonetta">See Sara</Link>
                <Link to="/tiles/barn">See Barn</Link>
              </p>
            </header>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
