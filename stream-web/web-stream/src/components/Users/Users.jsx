import React, { useState } from "react";
import "./Users.css";
import Login from "../Login/Login";
import Singup from "../SingUp/Singup";

const Users = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handle_user = (user_info) => {
    setIsLogin(() => {
      const update_login = user_info;
      return update_login;
    });
  };

  return (
    <>
      <div className="login-container">
        <div className="user_toggle">
          <button
            type="button"
            className={isLogin ? "users-button" : "login-button-active"}
            onClick={() => handle_user(true)}
          >
            로그인
          </button>
          <button
            type="button"
            className={isLogin ? "login-button-active" : "users-button"}
            onClick={() => handle_user(false)}
          >
            회원가입
          </button>
        </div>

        {isLogin ? <Login /> : <Singup is_login={handle_user} />}
      </div>
    </>
  );
};

export default Users;
