import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './components/homePage';
import GameGallery from './components/GameGallery';
function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGames = async (query) => {
  setLoading(true);
  try{
      const response = await fetch(`http://localhost:3000/api/search?q=${query}`);
      const data = await response.json();
      setGames(data);
    } catch(error){
    console.error('Error fetching games:', error);
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <HomePage onSearch={fetchGames}/>
      {loading ? (
       <div className="loading-container">
        <div className="loader"/>
       </div>
      ) : (
        <GameGallery games={games}/>
      )
    }
    </div>
  );
}

export default App;
