// components/Header.js
import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"; // Importing the CSS file for styling

const Header = () => {
  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <img src="../../../Mainlogo.png" className="mainlogo"></img>
        CLOUDER
      </Link>
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        {sessionStorage.getItem("userName") ? (
          <Link to="/mypage">{sessionStorage.getItem("userName")}</Link>
        ) : (
          <Link to="/login">로그인</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
