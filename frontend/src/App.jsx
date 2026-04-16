// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🛡️ Malware Detector
            </Link>
            
            <div className="nav-links">
              <Link to="/" className="nav-link">Scan</Link>
              <Link to="/history" className="nav-link">History</Link>
              <Link to="/about" className="nav-link">About</Link>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<ScanPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
        
        <footer className="footer">
          <p>© 2025 Malware Detection System | B.Tech Project</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;