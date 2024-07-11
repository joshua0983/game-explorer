import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/homePage';
import GameInfo from './components/GameInfo';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game-info" element={<GameInfo />} />
      </Routes>
    </Router>
  );
};

export default App;