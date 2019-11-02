import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import Home from './Home';
import MdxPage from './MdxPage';
import ScrollToTop from './ScrollToTop';
import Search from './Search';
import Nav from './Nav';
import { SpeechRecognitionContextProvider } from './SpeechRecognition';
import wallpaper from './wallpaper.png';
import { routes } from './contentFiles';

function App() {
  return (
    <React.StrictMode>
      <SpeechRecognitionContextProvider>
        <Router>
          <ScrollToTop />
          <Nav />
          <Container fluid>
            <Row>
              <Col lg="2" md="1" style={{ backgroundImage: 'url(' + wallpaper + ')' }} />
              <Col lg="8" md="10">
                <div className="content">
                  <Switch>
                    {Object.keys(routes).map(route => <Route exact path={route} key={route}><MdxPage /></Route>)}
                    <Route path="/search">
                      <Search />
                    </Route>
                    <Route path="/">
                      <Home />
                    </Route>
                  </Switch>
                </div>
              </Col>
              <Col lg="2" md="1" style={{ backgroundImage: 'url(' + wallpaper + ')' }} />
            </Row>
          </Container>
        </Router>
      </SpeechRecognitionContextProvider>
    </React.StrictMode>
  );
}

export default App;
