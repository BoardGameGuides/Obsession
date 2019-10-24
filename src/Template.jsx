import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

/**
 * @param {{ children: React.ReactNode; route: string; }} props
 */
export default function Template(props) {
  return (
    <Container fluid>
      <Row>
        <Col>
          <Link to="/search">Search</Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="content">
            {props.children}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
