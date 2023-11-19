// components/Header.js
import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"; // Importing the CSS file for styling

const Header = () => {
  return (
    <header className="site-header">
      <Link to="/" className="logo">
        StreamingService
      </Link>
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        {localStorage.getItem("userName") ? (
          <Link to="/mypage">{localStorage.getItem("userName")}</Link>
        ) : (
          <Link to="/login">로그인</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
