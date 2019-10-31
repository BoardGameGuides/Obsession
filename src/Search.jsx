import React from 'react';
import ReactDOM from 'react-dom';
import { parse, stringify } from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import { Form, FormGroup, ListGroup } from 'react-bootstrap';
import VoiceSearchBox from './VoiceSearchBox';
import { index } from './searchIndex';
import { routes } from './contentFiles';
import { numberToWords } from './shared/searchSettings';

/**
 * 
 * @param {{route: string;}} props 
 */
function SearchResult(props) {
  return <ListGroup.Item as={Link} to={props.route} action>{routes[props.route].displayTitle}</ListGroup.Item>;
}

/**
 * @typedef {object} Props
 * @prop {string} route
 * @prop {import("history").Location} location
 * @prop {import("history").History} history
 *
 * @extends {React.Component<Props>}
 */
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = { query: '', results: [] };

    this.search = this.search.bind(this);
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

  componentDidMount() {
    this.search(this.requestedQuery());
    this.searchInput.focus();
  }

  render() {
    return (
      <div>
        <Form>
          <FormGroup>
            <VoiceSearchBox value={this.state.query} onValueChange={this.search} ref={/** @type {any} */ (input) => this.searchInput = /** @type {HTMLInputElement} */ (ReactDOM.findDOMNode(input))} />
          </FormGroup>
        </Form>
        <ListGroup>
          {this.state.results.map(route => <SearchResult key={route} route={route} />)}
        </ListGroup>
      </div>
    );
  }
}

export default withRouter(Search);
