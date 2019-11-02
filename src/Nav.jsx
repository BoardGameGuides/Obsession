import React from 'react';
import { Link, Switch, Route, useHistory, useLocation } from 'react-router-dom';
import { Navbar, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import VoiceSearchBox from './VoiceSearchBox';
import logo30 from './logo30.png';
import { name } from './shared/game-specific/properties';
import { locationSearchToQuery, queryToLocationSearch } from './Search';

export default function Nav() {
  const location = useLocation();
  const history = useHistory();
  const logo = <img src={logo30} width="30" height="30" alt={name + " logo"} />;
  return (
    <Navbar bg="light" className="d-flex justify-content-between">
      <ul className="navbar-nav">
        <Navbar.Brand>
          <Switch>
            <Route exact path="/">{logo}</Route>
            <Route>
              <Link to="/">
                {logo}
              </Link>
            </Route>
          </Switch>
        </Navbar.Brand>
        <Form inline>
          <Button onClick={history.goBack} variant="outline-primary"><FontAwesomeIcon icon={faArrowLeft} /><span className="d-none d-md-inline"> Back</span></Button>
        </Form>
      </ul>
      <ul className="navbar-nav col-lg-6 col-md-7 mx-2 px-0">
        <Switch>
          <Route exact path="/search">
            <VoiceSearchBox value={locationSearchToQuery(location.search)} onValueChange={value => history.replace({ search: queryToLocationSearch(value) })} />
          </Route>
          <Route>
            <VoiceSearchBox value="" onValueChange={value => history.push('/search' + queryToLocationSearch(value))} />
          </Route>
        </Switch>
      </ul>
      <ul className="navbar-nav">
        <Form inline>
          <Button as={Link} to="/settings" variant="outline-primary"><FontAwesomeIcon icon={faWrench} /><span className="d-none d-md-inline"> Settings</span></Button>
        </Form>
      </ul>
    </Navbar>
  );
}
