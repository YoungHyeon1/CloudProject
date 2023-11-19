import React, { createContext, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AppProvider = ({ children }) => {
  const auth_login = (session) => {
    localStorage.setItem("accessToken", session.getAccessToken().getJwtToken());
    localStorage.setItem("userName", session.getIdToken().payload.nickname);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
  };

  return (
    <AuthContext.Provider value={{ auth_login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
