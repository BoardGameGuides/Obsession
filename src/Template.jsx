import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Container, Row, Col, Navbar, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faWrench, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import logo30 from './logo30.png';
import wallpaper from './wallpaper.png';
import { name } from './shared/game-specific/properties';
import { CurrentRouteContext } from './state/currentRoute';

/**
 * 
 * @param {{route: string; children?: import('react').ReactNode;}} props 
 */
export default function Template(props) {
  const history = useHistory();
  const logo = <img src={logo30} width="30" height="30" alt={name + " logo"} />;
  return (
    <CurrentRouteContext.Provider value={props.route}>
      <Navbar bg="light">
        <ul className="navbar-nav mr-auto">
          <Navbar.Brand>
            {props.route === '/' ? logo :
              <Link to="/">
                {logo}
              </Link>
            }
          </Navbar.Brand>
          <Form inline>
            <Button onClick={history.goBack} variant="outline-primary"><FontAwesomeIcon icon={faArrowLeft} /> Back</Button>
          </Form>
        </ul>
        {props.route === '/search' ? null :
          <ul className="navbar-nav flex-grow-1 justify-content-center">
            <Form inline>
              <Button as={Link} to="/search" variant="outline-primary"><FontAwesomeIcon icon={faSearch} /> Search</Button>
            </Form>
          </ul>
        }
        <ul className="navbar-nav">
          <Form inline>
            <Button as={Link} to="/settings" variant="outline-primary"><FontAwesomeIcon icon={faWrench} /> Settings</Button>
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
