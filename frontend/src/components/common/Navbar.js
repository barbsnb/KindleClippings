import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Clippings.io for free</div>
      <div className="navbar-links">
        <a href="/stats" className="navbar-link">Statistics</a>
      </div>
    </nav>
  );
};

export default Navbar;
