import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../AppProvider";
import "./Header.css";
import axios from 'axios';

const Header = () => {
  const { isLogin } = useAuth();
  const currentNickname = sessionStorage.getItem("chanelName");
  const [profileImg, setProfileImg] = useState("");

  useEffect(() => {
    if (isLogin && currentNickname) {
      axios.get('https://xw6vimxva3.execute-api.ap-northeast-2.amazonaws.com/develop/public/users', {
        params: {
          getProfile: currentNickname
        }
      })
      .then(response => {
        const userProfile = response.data;
        if (userProfile) {
          setProfileImg(userProfile.profile);
        }
      })
      .catch(error => {
        console.error(error);
      });
    }
  }, [isLogin, currentNickname]);

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <img src="/images/Mainlogo.png" alt="Main Logo" className="mainlogo" />
      </Link>
      <nav className="main-nav">
        <a href="https://github.com/YoungHyeon1/CloudProject" className="profile">Github</a>
        {isLogin ? (
          <Link to="/mypage">
            <img src={profileImg} className='profileImg' />
          </Link>
        ) : (
          <Link to="/login" className="loginbtn">로그인</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;