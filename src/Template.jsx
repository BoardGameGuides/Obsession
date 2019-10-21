import React from 'react';
import { Link } from 'react-router-dom';
import { index } from './searchIndex';
import { routes } from './contentFiles';

export default class Template extends React.Component {
  constructor(props) {
    super(props);
    this.state = {query: '', results: [], focused: false};

    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  search(query) {
    let results = index.search(query).map(x => '/' + x.ref);
    if (results.length === 0) {
      results = index.search(query + '*').map(x => '/' + x.ref);
    }
    console.log(results);
    this.setState({query, results});
  }

  handleChange(event) {
    this.search(event.target.value);
  }

  handleFocus() {
    this.setState({focused: true});
    this.search('');
  }

  handleBlur() {
    this.setState({query: '', focused: false});
  }

  render() {
    return (
      <div>
        <div className="page-header">
          <input type="text" value={this.state.query} onChange={this.handleChange} onFocus={this.handleFocus} placeholder="Search..." />
          { this.state.focused ? <button onClick={this.handleBlur}>X</button> : null }
        </div>
        <div className="page-body">
          {
            this.state.focused ?
                <div>{this.state.results.map(route => <div key={route}><Link to={route} replace={this.props.route === route} onClick={this.handleBlur}>{routes[route].displayTitle}</Link></div>)}</div> :
                <div>{this.props.children}</div>
          }
        </div>
      </div>
    );
  }
}
