import React, { useState, useEffect } from 'react';
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

/**
 * Gets the search query from the location uri.
 * @param {import('history').Location} location
 */
function getQuery(location) {
  const uriParameters = parse(location.search);
  return (/** @type {string} */ (uriParameters.q) || '').trim();
}

export default function Search() {
  const history = useHistory();
  const location = useLocation();
  const [results, setResults] = useState(/** @type {string[]} */ ([]));

  /**
   * If the requested query does not match the current location uri, then update the location uri.
   * @param {string} query 
   */
  function updateQuery(query) {
    if (query !== getQuery(location)) {
      history.replace({ search: '?' + stringify({ q: query }) });
    }
  }

  /** Perform a search on load and every time the location uri changes. */
  useEffect(() => {
    const query = getQuery(location);

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
    setResults(results);
  }, [location]);

  return (
    <div>
      <Form>
        <FormGroup>
          <VoiceSearchBox value={getQuery(location)} onValueChange={updateQuery} />
        </FormGroup>
      </Form>
      <ListGroup>
        {results.map(route => <SearchResult key={route} route={route} />)}
      </ListGroup>
    </div>
  );
}
