import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Nav from './Nav';
import wallpaper from './wallpaper.png';
import { CurrentRouteContext } from './state/currentRoute';

/**
 * 
 * @param {{route: string; children?: import('react').ReactNode;}} props 
 */
export default function Template(props) {
  return (
    <CurrentRouteContext.Provider value={props.route}>
      <Nav/>
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
