import React, { useState } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button } from 'react-bootstrap';
import './HomePage.css';

const HomePage = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="homepage">
      <Navbar className="navbar-custom" expand="lg">
        <Container>
          <Navbar.Brand href="#home" className="navbar-brand-custom">Game Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" className="nav-link-custom">Home</Nav.Link>
              <Nav.Link href="#explore" className="nav-link-custom">Explore</Nav.Link>
            </Nav>
            <Form className="search-form-custom" onSubmit={handleSearchSubmit}>
              <FormControl
                type="search"
                placeholder="Search games"
                className="search-input-custom"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Button variant="outline-success" type="submit">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="welcome-section">
        <section id="home">
          <h1 className="welcome-title">Welcome to Game Explorer</h1>
          <p className="welcome-text">Discover and explore games with detailed information and videos.</p>
        </section>
      </Container>
    </div>
  );
};

export default HomePage;