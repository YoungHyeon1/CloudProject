import React, { useEffect, useState } from 'react';
import { Link, useAsyncError } from "react-router-dom";
import { useAuth } from "../AppProvider";
import "./Header.css";
import axios from 'axios';

const Header = () => {
  /**
   * 로그인이 되었는지는 AppProvider 의 Props입니다.
   * isLogin은 boolean 입니다.
   */
  const { isLogin} = useAuth();
  const [profileImg, setProfileImg] = useState();
  
  useEffect(()=> {
    axios.get('https://xw6vimxva3.execute-api.ap-northeast-2.amazonaws.com/develop/public/users')
    .then(response => {
      const currentNickname = sessionStorage.getItem("nickname");

      const userProfile = response.data.find(user => user.nickname === currentNickname);

      if(userProfile){
        setProfileImg(userProfile.profile);
      }
    }) .catch(error => {
      console.error(error);
    });
  }, []);

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <img src="/images/Mainlogo.png" className="mainlogo"></img>
      </Link>
      <nav className="main-nav">
        <Link to="https://github.com/YoungHyeon1/CloudProject" className="profile">Github</Link>
        {isLogin ? (
        <Link to="/mypage">
          <img src={profileImg} className='profileImg'></img>
        </Link>
        ) : (
          <Link to="/login" className="loginbtn">로그인</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
