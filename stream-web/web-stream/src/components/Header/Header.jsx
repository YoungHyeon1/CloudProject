import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../AppProvider";
import "./Header.css";

const Header = () => {
  /**
   * 로그인이 되었는지는 AppProvider 의 Props입니다.
   * isLogin은 boolean 입니다.
   */
  const { isLogin} = useAuth();
  
  console.log(sessionStorage.getItem);

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <img src="/images/Mainlogo.png" className="mainlogo"></img>
      </Link>
      <nav className="main-nav">
        <Link to="https://github.com/YoungHyeon1/CloudProject" className="profile">Github</Link>
        {isLogin ? (
        <Link to="/mypage">
          {sessionStorage.getItem("nickname")} </Link>
        ) : (
          <Link to="/login" className="loginbtn">로그인</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
