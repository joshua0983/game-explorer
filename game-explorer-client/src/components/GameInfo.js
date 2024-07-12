import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainStyles.css';
import './GameInfo.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const GameInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { game } = location.state;

  const platformIcons = {
    'playstation': 'bi-playstation',
    'xbox': 'bi-xbox',
    'pc': 'bi-pc-display',
    'nintendo': 'bi-nintendo-switch',
    'wii': 'bi-controller'
  };

  const renderedPlatforms = new Set();

  const formatReleaseDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating / 20);
    const halfStar = (rating % 20) >= 10;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => <i key={i} className="bi bi-star-fill"></i>)}
        {halfStar && <i className="bi bi-star-half"></i>}
        {[...Array(5 - fullStars - (halfStar ? 1 : 0))].map((_, i) => <i key={i + fullStars + 1} className="bi bi-star"></i>)}
      </>
    );
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

  return (
    <div className="game-info-page">
      <Navbar className="navbar-custom" expand="lg">
        <Container>
          <Navbar.Brand className="navbar-brand-custom">Game Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/" className="nav-link-custom">Home</Nav.Link>
              <Nav.Link onClick={handleRandomGame} className="nav-link-custom">Explore</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="welcome-section">
        <section id="game-info">
          <h2 className="welcome-title">{game.name}</h2>
          <div className="game-custom-card-container">
            <div className="game-custom-card">
              <img src={game.coverUrl} className="game-custom-card-img" alt={game.name} />
              <div className="platform-icons">
                {game.platforms.map((platform) => {
                  const lowerCasePlatform = platform.toLowerCase();
                  return Object.keys(platformIcons).map((key) => {
                    if (lowerCasePlatform.includes(key) && !renderedPlatforms.has(key)) {
                      renderedPlatforms.add(key);
                      return <i key={key} className={`bi ${platformIcons[key]} platform-icon`}></i>;
                    }
                    return null;
                  });
                })}
              </div>
            </div>
            <div className="game-details">
              {game.aggregatedRating && (
                <div className="rating">
                  <h3>Rating:</h3>
                  <div>{renderStars(game.aggregatedRating)}</div>
                </div>
              )}
              {game.firstReleaseDate && (
                <div className="release-date">
                  <h3>First Release Date:</h3>
                  <p>{formatReleaseDate(game.firstReleaseDate)}</p>
                </div>
              )}
              {game.genres && game.genres.length > 0 && (
                <div className="genres">
                  <h3>Genres:</h3>
                  <ul>
                    {game.genres.map((genre, index) => (
                      <li key={index}>{genre}</li>
                    ))}
                  </ul>
                </div>
              )}
              {game.gameModes && game.gameModes.length > 0 && (
                <div className="game-modes">
                  <h3>Game Modes:</h3>
                  <ul>
                    {game.gameModes.map((mode, index) => (
                      <li key={index}>{mode}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {game.storyline ? (
            <div className='storyline'>
              <h2>Storyline</h2>
              <p>{game.storyline}</p>
            </div>
          ) : (
            <div className='storyline'>
              <h2>Summary</h2>
              <p>{game.summary.split('.')[0] + '.'}</p>
            </div>
          )}
          <div className="screenshots-container">
            {game.screenshots.slice(0, 6).map((screenshot, index) => (
              <div key={index} className="screenshot-card">
                <img src={screenshot} alt={`Screenshot ${index + 1}`} />
              </div>
            ))}
          </div>
       </section>
      </Container>
    </div>
  );
};

export default GameInfo;