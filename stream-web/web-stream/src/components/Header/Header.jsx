// components/Header.js
import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"; // Importing the CSS file for styling
import { useAuth } from "../AppProvider";

const Header = () => {
  const { isLoggedIn } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        StreamingService
      </Link>
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        {isLoggedIn ? "안냥" : <Link to="/login">로그인</Link>}
      </nav>
    </header>
  );
};

export default Header;
