import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

const HomePage = () => {
  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Game Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#explore">Explore</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-5">
        <section id="home">
          <h1>Welcome to Game Explorer</h1>
          <p>Discover and explore games with detailed information and videos.</p>
        </section>
      </Container>
    </div>
  );
};

export default HomePage;