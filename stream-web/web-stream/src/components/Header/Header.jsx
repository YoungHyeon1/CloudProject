import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AppProvider";
import "./Header.css";


const Header = () => {
  /**
   * 로그인이 되었는지는 AppProvider 의 Props입니다.
   * isLogin은 boolean 입니다.
   */
  const { isLogin } = useAuth();

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
