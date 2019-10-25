import React from 'react';
import ReactDOM from 'react-dom';
import { parse, stringify } from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import { Form, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { index } from './searchIndex';
import { routes } from './contentFiles';
import { numberToWords } from './shared/searchSettings';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = { query: '', results: [] };

    this.handleChange = this.handleChange.bind(this);
  }

  requestedQuery() {
    const uriParameters = parse(this.props.location.search);
    return (/** @type {string} */ (uriParameters.q) || '').trim();
  }

  /**
   * @param {string} query 
   */
  search(query) {
    if (query !== this.requestedQuery()) {
      this.props.history.replace({ search: '?' + stringify({ q: query }) });
    }

    // Handle numeric searches specially:
    // - Boost the number. If "10" is in the document, that's a very high match.
    // - Require the equivalent words. Allows "10" to match "ten".
    let expandedQuery = query;
    let isNumeric = false;
    if (query.match(/^[0-9]+$/)) {
      isNumeric = true;
      expandedQuery = query + '^2 ' + numberToWords(query).map(x => '+' + x).join(' ');
    }

    // In lunr, wildcards prevent the search pipeline from executing. So always try a non-wildcard search first.
    console.log('Searching', expandedQuery);
    let queryResults = index.search(expandedQuery);
    if (queryResults.length === 0 && !isNumeric) {
      expandedQuery = query + '*';
      console.log('Searching', expandedQuery);
      queryResults = index.search(expandedQuery);
    }
    const results = queryResults.map(x => '/' + x.ref);
    console.log(results);
    this.setState({ query, results });
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
        <Form>
          <FormGroup>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
              </InputGroup.Prepend>
              {/*
              // @ts-ignore */}
              <FormControl type="text" value={this.state.query} onChange={this.handleChange} placeholder="Search..." ref={input => this.searchInput = /** @type {InputElement} */ (ReactDOM.findDOMNode(input))} />
            </InputGroup>
          </FormGroup>
        </Form>
        <div>
          {this.state.results.map(route => <div key={route}><Link to={route} replace={this.props.route === route}>{routes[route].displayTitle}</Link></div>)}
        </div>
      </div>
    );
  }
}

export default withRouter(Search);
