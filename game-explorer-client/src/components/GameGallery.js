import React, { useState } from 'react';
import GameCard from './GameCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GameGallery.css';

const GameGallery = ({ games, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handleNext = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    onPageChange(nextPage);
  };

  const handlePrevious = () => {
    const previousPage = currentPage - 1;
    setCurrentPage(previousPage);
    onPageChange(previousPage);
  };

  return (
    <div style={{ backgroundColor: '#101720', color: 'white', minHeight: '30vh' }}>
      <div className="container">
        <div className="row">
          {games.map((game) => (
            <div className="col-md-3 mb-4" key={game.id}>
              <GameCard game={game} />
            </div>
          ))}
        </div>
        <div className="pagination">
          {currentPage > 1 && (
            <div className="icon" onClick={handlePrevious}>
              <svg viewBox="0 0 16 16" className="bi bi-chevron-double-left" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" fillRule="evenodd"></path>
                <path d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" fillRule="evenodd"></path>
              </svg>
            </div>
          )}
          {games.length === 12 && (
            <div className="icon" onClick={handleNext}>
              <svg viewBox="0 0 16 16" className="bi bi-chevron-double-right" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z" fillRule="evenodd"></path>
                <path d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z" fillRule="evenodd"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameGallery;