import React from 'react';
import { parse, stringify } from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import { index } from './searchIndex';
import { routes } from './contentFiles';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {query: '', results: []};

    this.handleChange = this.handleChange.bind(this);
  }

  requestedQuery() {
    const uriParameters = parse(this.props.location.search);
    return uriParameters.q || '';
  }

  search(query) {
    if (query !== this.requestedQuery()) {
      this.props.history.replace({ search: '?' + stringify({ q: query })});
    }
    const results = index.search(query + '*').map(x => '/' + x.ref);
    console.log(results);
    this.setState({query, results});
  }

  handleChange(event) {
    this.search(event.target.value);
  }

  componentDidMount() {
    this.search(this.requestedQuery());
    this.searchInput.focus();
  }

  render() {
    return (
      <div>
        <div className="page-header">
          <input type="text" value={this.state.query} onChange={this.handleChange} placeholder="Search..." ref={input => this.searchInput = input} />
        </div>
        <div className="page-body">
          {this.state.results.map(route => <div key={route}><Link to={route} replace={this.props.route === route}>{routes[route].displayTitle}</Link></div>)}
        </div>
      </div>
    );
  }
}

export default withRouter(Search);
