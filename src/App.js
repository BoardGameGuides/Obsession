import React from 'react';
import logo from './logo.svg';
import './App.css';

const content = {};
function importAll (r) {
  r.keys().forEach(key => content[key] = r(key));
}
importAll(require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/));

var Test = content[Object.keys(content)[0]].default;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Test/>
      </header>
    </div>
  );
}

export default App;
