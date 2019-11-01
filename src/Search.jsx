import React, { useState, useEffect } from 'react';
import { parse, stringify } from 'query-string';
import { Link, useLocation } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import { index } from './searchIndex';
import { routes } from './contentFiles';
import { numberToWords } from './shared/searchSettings';

/**
 * Gets the search query from the location search uri.
 * @param {string} locationSearch
 */
export function locationSearchToQuery(locationSearch) {
  const uriParameters = parse(locationSearch);
  return (/** @type {string} */ (uriParameters.q) || '').trim();
}

/**
 * Builds the search query into a location search uri.
 * @param {string} query 
 */
export function queryToLocationSearch(query) {
  return '?' + stringify({ q: query });
}

/**
 * 
 * @param {{route: string;}} props 
 */
function SearchResult(props) {
  return <ListGroup.Item as={Link} to={props.route} action>{routes[props.route].displayTitle}</ListGroup.Item>;
}

export default function Search() {
  const location = useLocation();
  const [results, setResults] = useState(/** @type {string[]} */ ([]));

  /** Perform a search on load and every time the location uri changes. */
  useEffect(() => {
    const query = locationSearchToQuery(location.search);

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
  }, [location.search]);

  return (
    <div>
      <ListGroup>
        {results.map(route => <SearchResult key={route} route={route} />)}
      </ListGroup>
    </div>
  );
}
