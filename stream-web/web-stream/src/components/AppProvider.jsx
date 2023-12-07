import React, { createContext, useContext, useEffect, useState } from 'react';
import * as config from '../config';
import PropTypes from 'prop-types';
import {
  CognitoUserPool,
  CognitoUser,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
const userPool = new CognitoUserPool({
  UserPoolId: config.UserPoolId,
  ClientId: config.ClientId,
});

const refreshSession = (username, refreshTokenString) => {
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);
  // 문자열 형태의 리프레시 토큰을 CognitoRefreshToken 객체로 변환
  const refreshToken = new CognitoRefreshToken({
    RefreshToken: refreshTokenString,
  });
  cognitoUser.refreshSession(refreshToken, (err, session) => {
    if (err) {
      console.error(err);
      setIsLogin(false);
      return;
    }
  });
};

const logoutSession = username => {
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);
  cognitoUser.signOut();
};

export const AppProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if (userPool.getCurrentUser()) {
      userPool.getCurrentUser().getSession((err, session) => {
        if (err) {
          setIsLogin(false);
        } else {
          refreshSession(
            session.accessToken.payload.username,
            session.refreshToken.token
          );
          sessionStorage.setItem('nickname', session.idToken.payload.nickname);
          setIsLogin(true);
        }
      });
    }
  }, []);

  const auth_login = () => {
    setIsLogin(true);
  };

  const logout = () => {
    setIsLogin(false);
    logoutSession(userPool.getCurrentUser().getUsername());
  };

  return (
    <AuthContext.Provider value={{ auth_login, logout, isLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
