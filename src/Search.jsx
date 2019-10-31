import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { parse, stringify } from 'query-string';
import { Link, useLocation, useHistory } from 'react-router-dom';
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

export default function Search() {
  const history = useHistory();
  const location = useLocation();
  const [state, setState] = useState({ query: '', results: [] });

  function requestedQuery() {
    const uriParameters = parse(location.search);
    return (/** @type {string} */ (uriParameters.q) || '').trim();
  }

  function search() {
    const query = requestedQuery();

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
    setState({ query, results });
  }

  /**
   * @param {string} query 
   */
  function updateQuery(query) {
    if (query !== requestedQuery()) {
      history.replace({ search: '?' + stringify({ q: query }) });
    }
  }

  useEffect(() => {
    search();
  }, [location]);

  return (
    <div>
      <Form>
        <FormGroup>
          <VoiceSearchBox value={state.query} onValueChange={updateQuery} />
        </FormGroup>
      </Form>
      <ListGroup>
        {state.results.map(route => <SearchResult key={route} route={route} />)}
      </ListGroup>
    </div>
  );
}
