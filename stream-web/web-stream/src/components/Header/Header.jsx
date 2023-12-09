import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AppProvider';
import './Header.css';
import axios from 'axios';
import * as config from '../../config';

const axiosApi = axios.create({
  baseURL: config.ApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Header = () => {
  const { isLogin } = useAuth();
  const channelCode = sessionStorage.getItem('chanelName');
  const [profileImg, setProfileImg] = useState('');

  const handleGetProfile = () => {
    try {
      axiosApi
        .get('/public/users', {
          params: {
            getProfile: channelCode,
          },
        })
        .then(res => {
          setProfileImg(res.data.profile);
        });
      // setProfileImg(response.data.profile);
    } catch (error) {
      console.log('Error:', error);
    }
  };

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
            {handleGetProfile()}
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
