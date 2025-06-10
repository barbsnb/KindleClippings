import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">MyApp</div>
      <div className="navbar-links">
        <a href="/home" className="navbar-link">Home</a>
      </div>
    </nav>
  );
};

export default Navbar;
