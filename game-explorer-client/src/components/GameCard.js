import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GameCard.css'; 
const GameCard = ({ game }) => (
  <div className="card custom-card">
    <img src={game.coverUrl} className="card-img-top custom-card-img" alt={game.name} />
    <div className="layer"></div>
    <div className="card-body">
      <h5 className="card-title">{game.name}</h5>
    </div>
    <div className="info">
      <h1>{game.name}</h1>
      <p>{game.summary}</p>
      <button>Explore</button>
      <button onClick={() => window.open(game.videoUrl, '_blank')}>Watch Video</button>
    </div>
  </div>
);

export default GameCard;