import React from 'react';
import GameCard from './GameCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GameGallery.css';

const GameGallery = ({ games }) => (
  <div style={{ backgroundColor: 'black', color: 'white', minHeight: '30vh' }}>
    <div className="container">
      <div className="row">
        {games.map(game => (
          <div className="col-md-3 mb-4" key={game.id}>
            <GameCard game={game} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default GameGallery;