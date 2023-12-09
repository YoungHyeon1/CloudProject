import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AppProvider';
import './Header.css';

const Header = () => {
  const { isLogin, profileImg } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <img src="/images/Mainlogo.png" alt="Main Logo" className="mainlogo" />
      </Link>
      <nav className="main-nav">
        <a
          href="https://github.com/YoungHyeon1/CloudProject"
          className="profile"
        >
          Github
        </a>
        {isLogin ? (
          <Link to="/mypage">
            <img src={profileImg} className="profileImg" />
          </Link>
        ) : (
          <Link to="/login" className="loginbtn">
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
