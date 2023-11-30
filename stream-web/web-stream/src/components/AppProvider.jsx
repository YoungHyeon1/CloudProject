import React, { createContext, useContext, useEffect, useState } from "react";
import * as config from "../config";
import { CognitoUserPool } from "amazon-cognito-identity-js";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
const userPool = new CognitoUserPool({
  UserPoolId: config.UserPoolId,
  ClientId: config.ClientId,
});

export const AppProvider = ({ children }) => {
  useEffect(() => {
    if (userPool.getCurrentUser()) {
      setIsLogin(true);
    }
  }, []);
  const [isLogin, setIsLogin] = useState(false);

  const auth_login = (session) => {
    setIsLogin(true);
    // const auth_login = (session) => {
    //   sessionStorage.setItem(
    //     "accessToken",
    //     session.getAccessToken().getJwtToken()
    //   );
    //   sessionStorage.setItem("userName", session.getIdToken().payload.nickname);
  };

  const logout = () => {
    setIsLogin(false);
    userPool.getCurrentUser().signOut();
  };

  return (
    <AuthContext.Provider value={{ auth_login, logout, isLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
