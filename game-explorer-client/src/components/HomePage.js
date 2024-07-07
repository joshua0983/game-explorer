import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button } from 'react-bootstrap';
import GameGallery from './GameGallery';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchGames = async (query, page) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: query,
          page: page
        }
      });
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(searchQuery, page);
  }, [searchQuery, page]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
            <Form className="search-form-custom" onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}>
              <FormControl
                type="search"
                placeholder="Search games"
                className="search-input-custom"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline-success" type="submit">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="welcome-section">
        <section id="home">
          <h1 className="welcome-title">Game Explorer</h1>
        </section>
      </Container>
      {loading ? (
        <div className="loading-container">
          <div className="loader" />
        </div>
      ) : (
        <GameGallery games={games} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default HomePage;