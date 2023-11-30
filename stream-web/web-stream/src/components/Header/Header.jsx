// components/Header.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AppProvider";

import "./Header.css"; // Importing the CSS file for styling

const Header = () => {
  const { isLogin, logout, auth_login } = useAuth();
  const [userName, setUserName] = useState("");

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <img src="/images/Mainlogo.png" className="mainlogo"></img>
        CLOUMER
      </Link>
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        {isLogin ? (
          <Link to="/mypage">{sessionStorage.getItem("nickname")}</Link>
        ) : (
          <Link to="/login">로그인</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
