// frontend/src/components/Header/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🛡️</span>
          <span className="logo-text">Malware Detector</span>
        </Link>
        
        <nav className="header-nav">
          <Link to="/" className="nav-item">Scan</Link>
          <Link to="/history" className="nav-item">History</Link>
          <Link to="/about" className="nav-item">About</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;