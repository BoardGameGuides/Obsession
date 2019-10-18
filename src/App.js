import React from 'react';
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import './App.css';
import Home from './Home';
import { combine } from './path';
import { images, routes } from './contentFiles';
import { index } from './searchIndex';

window.index = index;

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
            <Home/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
