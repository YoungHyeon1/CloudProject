import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AppProvider";
import * as config from "../../config";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { auth_login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const poolData = {
    UserPoolId: config.UserPoolId,
    ClientId: config.ClientId,
  };
  const userPool = new CognitoUserPool(poolData);

  const handleSubmit = () => {
    /**
     * Cognito의 로그인을 위한 인증정보를 생성합니다.
     * 로그인에 성공하면 SessionStorage 에 Nickname을 저장합니다.
     * 이후 MainPage로 이동합니다.
     * auth_login은 Context로 관리됩니다.
     */
    const authenticationData = {
      Username: email,
      Password: password,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        sessionStorage.setItem("nickname", session.idToken.payload.nickname);
        auth_login();  // AppProvider
        navigate("/");
      },
      onFailure: (err) => {
        alert(err.message || JSON.stringify(err));
      },
    });
  };

  return (
    <>
      <div className="input-group">
        <label htmlFor="username">Email</label>
        <input
          id="username"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="login-button" onClick={handleSubmit}>
        로그인
      </button>
    </>
  );
};

export default Login;
