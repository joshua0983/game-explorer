import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import './MainStyles.css';
import './GameInfo.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const GameInfo = () => {
  const location = useLocation();
  const { game } = location.state;

  const platformIcons = {
    'playstation': 'bi-playstation',
    'xbox': 'bi-xbox',
    'pc': 'bi-pc-display',
    'nintendo': 'bi-nintendo-switch',
    'wii': 'bi-controller'
  };

  const renderedPlatforms = new Set();

  return (
    <div className="game-info-page">
      <Navbar className="navbar-custom" expand="lg">
        <Container>
          <Navbar.Brand href="/" className="navbar-brand-custom">Game Explorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/" className="nav-link-custom">Home</Nav.Link>
              <Nav.Link href="#explore" className="nav-link-custom">Explore</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="welcome-section">
        <section id="game-info">
          <h2 className="welcome-title">{game.name}</h2>
          <div className="game-custom-card">
            <img src={game.coverUrl} className="game-custom-card-img" alt={game.name} />
          </div>
          {game.storyline && (
            <div className='storyline'>
              <h2>Storyline</h2>
              <p>{game.storyline}</p>
            </div>
          )}
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
          <div className="screenshots-container">
            {game.screenshots.slice(0, 6).map((screenshot, index) => (
              <div key={index} className="screenshot-card">
                <img src={screenshot} alt={`Screenshot ${index + 1}`} />
              </div>
            ))}
          </div>
          {/* Add more game details here */}
       </section>
      </Container>
    </div>
  );
};

export default GameInfo;