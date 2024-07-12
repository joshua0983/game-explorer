import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import GameGallery from './GameGallery';
import axios from 'axios';
import './MainStyles.css';
import '../App.css';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [displayed, setDisplayed] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const limit = 12;

  const fetchGames = async (query, page) => {
    setLoading(true);
    try {
      let newGames = [];
      let currentPage = page;

      // Keep fetching until we have enough new games
      while (newGames.length < limit) {
        const response = await axios.get('/api/search', {
          params: {
            q: query,
            page: currentPage,
            limit: limit
          }
        });

        const fetchedGames = response.data;

        // Filter out games that are already displayed in any page
        const filteredGames = fetchedGames.filter(game => !Object.values(displayed).flat().some(d => d.gameId === game.gameId));

        newGames = [...newGames, ...filteredGames];

        if (fetchedGames.length < limit) break; // Break if we didn't fetch a full page, to avoid infinite loop

        currentPage++;
      }

      // Ensure we only take the required number of games
      newGames = newGames.slice(0, limit);

      setGames(newGames);
      setDisplayed(prevDisplayed => ({
        ...prevDisplayed,
        [page]: newGames
      }));
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
    setDisplayed({}); // Clear previously displayed games
    fetchGames(query, 1); // Fetch games with the new search query and page 1
  };

  const handlePageChange = (newPage) => {
    if (displayed[newPage]) {
      // If the games for the requested page are already in the dictionary, display them
      setGames(displayed[newPage]);
    } else {
      // Otherwise, fetch new games
      fetchGames(searchQuery, newPage);
    }
    setPage(newPage);
  };

  const handleRandomGame = async () => {
    try {
      const response = await axios.get('/api/random-game');
      const randomGame = response.data;
      navigate('/game-info', { state: { game: randomGame } });
    } catch (error) {
      console.error('Error fetching random game:', error);
    }
  };

  useEffect(() => {
    // Fetch top 100 games on initial load
    fetchGames('', 1);
  }, []);

  return (
    <div className="homepage">
      <Navbar className="navbar-custom" expand="lg">
        <Container>
          <Navbar.Brand className="navbar-brand-custom">Game Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" className="nav-link-custom">Home</Nav.Link>
              <Nav.Link onClick={handleRandomGame} className="nav-link-custom">Explore</Nav.Link>
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
        <GameGallery games={games} currentPage={page} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default HomePage;