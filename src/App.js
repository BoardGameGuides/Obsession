import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MDXProvider } from '@mdx-js/react';
import { Builder } from 'lunr';
import { combine } from './path';
import { importContext } from './importer';
import logo from './logo.svg';
import './App.css';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const images = importContext(require.context('./content/', true, /\.(jpg|png)$/));
const pages = importContext(require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/));

const routes = {};
for (const path in pages) {
  const route = path.replace(/^\.+/, '').replace(/\.mdx$/, '');
  routes[route] = {
    path,
    route,
    Component: pages[path].importedModule.default,
    metadata: pages[path].importedModule.frontMatter
  };
}

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
  for (const route of Object.keys(routes)) {
    const doc = Object.assign(routes[route].metadata, {
      id: route,
      text: plaintext(routes[route].Component),
      type: route.startsWith('/guests') ? 'guest' : 'tile'
    });
    console.log(doc);
    builder.add(doc);
  }
  window.index = builder.build();
}

/** Whether the string is an external resource, i.e., an absolute or protocol relative URI. */
function isExternal(text) {
  return text.startsWith('//') || text.search(/^[a-zA-Z]+:/) !== -1;
}

function RelativeImage(route) {
  return function (props) {
    if (isExternal(props.src))
      return <img {...props} alt={props.alt} />;

    const imageImportPath = combine(routes[route].path, '..', props.src);
    const image = images[imageImportPath].importedModule;
    return <img {...props} alt={props.alt} src={image} />;
  };
}

function RelativeLink(route) {
  return function (props) {
    if (isExternal(props.href))
      return <a {...props}>{props.children}</a>;

    const relativePath = combine(routes[route].path, '..', props.href);
    return <Link {...props} to={relativePath}/>;
  }
}

function getComponents(route) {
  return {
    img: RelativeImage(route),
    a: RelativeLink(route)
  };
}

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          {Object.keys(routes).map(route => <Route exact path={route} key={route}><MDXProvider components={getComponents(route)}>{React.createElement(routes[route].Component)}</MDXProvider></Route>)}
          <Route path="/">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <p>
                <Link to="/guests/sara-forbes-bonetta">See Sara</Link>
              </p>
              <p>
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
