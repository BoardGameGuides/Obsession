import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Navbar } from 'react-bootstrap';
import logo30 from './logo30.png';
import { name } from './shared/game-specific/properties';

/**
 * @param {{ children: React.ReactNode; route: string; }} props
 */
export default function Template(props) {
  return (
    <div>
      <Navbar bg="light">
        <Navbar.Brand>
          <Link to="/">
            <img src={logo30} width="30" height="30" alt={name + " logo"} />
          </Link>
        </Navbar.Brand>
        <Link to="/search">Search</Link>
      </Navbar>
      <Container fluid>
        <Row>
          <Col>
            <div className="content">
              {props.children}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
