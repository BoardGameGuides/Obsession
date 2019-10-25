import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Container, Row, Col, Navbar, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faWrench, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import logo30 from './logo30.png';
import { name } from './shared/game-specific/properties';

const isInStandaloneMode = (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator['standalone']) || document.referrer.includes('android-app://');

/**
 * @param {{ children: React.ReactNode; route: string; }} props
 */
class Template extends React.Component {
  constructor(props) {
    super(props);

    this.back = this.back.bind(this);
  }

  back() {
    this.props.history.goBack();
  }

  render() {
    return (
      <div>
        <Navbar bg="light">
          <Navbar.Brand>
            <Link to="/">
              <img src={logo30} width="30" height="30" alt={name + " logo"} />
            </Link>
          </Navbar.Brand>
          {!isInStandaloneMode ? null :
            <Form inline>
              <Button onClick={this.back} variant="outline-primary"><FontAwesomeIcon icon={faArrowLeft} /> Back</Button>
            </Form>
          }
          <Form inline>
            <Button as={Link} to="/search" variant="outline-primary"><FontAwesomeIcon icon={faSearch} /> Search</Button>
          </Form>
          <Form inline>
            <Button as={Link} to="/settings" variant="outline-primary"><FontAwesomeIcon icon={faWrench} /> Settings</Button>
          </Form>
        </Navbar>
        <Container fluid>
          <Row>
            <Col>
              <div className="content">
                {this.props.children}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default withRouter(Template);