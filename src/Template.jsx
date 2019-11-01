import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col, Navbar, Form, Button } from 'react-bootstrap';
import { parse, stringify } from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import logo30 from './logo30.png';
import wallpaper from './wallpaper.png';
import { name } from './shared/game-specific/properties';
import { CurrentRouteContext } from './state/currentRoute';
import VoiceSearchBox from './VoiceSearchBox';

/**
 * Gets the search query from the location uri.
 * @param {string} locationSearch
 */
function locationSearchToQuery(locationSearch) {
  const uriParameters = parse(locationSearch);
  return (/** @type {string} */ (uriParameters.q) || '').trim();
}

/**
 * 
 * @param {string} query 
 */
function queryToLocationSearch(query) {
  return '?' + stringify({ q: query });
}

/**
 * If the requested query does not match the current location uri, then update the location uri.
 * @param {import('history').Location} location
 * @param {import('history').History} history
 * @param {string} query 
 */
function updateLocation(location, history, query) {
  if (query !== locationSearchToQuery(location.search)) {
    history.replace({ search: queryToLocationSearch(query) });
  }
}

/**
 * 
 * @param {{route: string; children?: import('react').ReactNode;}} props 
 */
export default function Template(props) {
  const location = useLocation();
  const history = useHistory();
  const logo = <img src={logo30} width="30" height="30" alt={name + " logo"} />;
  const searchQuery = props.route === '/search' ? locationSearchToQuery(location.search) : "";
  /** @type {(value: string) => void} */
  const searchValueChange = props.route === '/search' ?
    value => history.replace({ search: queryToLocationSearch(value) }) :
    value => history.push('/search' + queryToLocationSearch(value));
  return (
    <CurrentRouteContext.Provider value={props.route}>
      <Navbar bg="light" className="d-flex justify-content-between">
        <ul className="navbar-nav">
          <Navbar.Brand>
            {props.route === '/' ? logo :
              <Link to="/">
                {logo}
              </Link>
            }
          </Navbar.Brand>
          <Form inline>
            <Button onClick={history.goBack} variant="outline-primary"><FontAwesomeIcon icon={faArrowLeft} /><span className="d-none d-md-inline"> Back</span></Button>
          </Form>
        </ul>
        <ul className="navbar-nav col-lg-6 col-md-7 mx-2 px-0">
          <VoiceSearchBox key="search" value={searchQuery} onValueChange={searchValueChange} />
        </ul>
        <ul className="navbar-nav">
          <Form inline>
            <Button as={Link} to="/settings" variant="outline-primary"><FontAwesomeIcon icon={faWrench} /><span className="d-none d-md-inline"> Settings</span></Button>
          </Form>
        </ul>
      </Navbar>
      <Container fluid>
        <Row>
          <Col lg="2" md="1" style={{ backgroundImage: 'url(' + wallpaper + ')' }} />
          <Col lg="8" md="10">
            <div className="content">
              {props.children}
            </div>
          </Col>
          <Col lg="2" md="1" style={{ backgroundImage: 'url(' + wallpaper + ')' }} />
        </Row>
      </Container>
    </CurrentRouteContext.Provider>
  );
}
