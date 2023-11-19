import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AppProvider";

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
    UserPoolId: "ap-northeast-2_PaBnNNLer",
    ClientId: "1ebc5fc6desmg3hr9pr3otuea7",
  };
  const userPool = new CognitoUserPool(poolData);

  const handleSubmit = () => {
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
        console.log(session);
        auth_login(session);
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
        <label htmlFor="password">Password</label>
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
