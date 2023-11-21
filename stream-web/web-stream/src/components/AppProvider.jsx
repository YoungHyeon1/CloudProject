import React, { createContext, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AppProvider = ({ children }) => {
  const auth_login = (session) => {
    sessionStorage.setItem(
      "accessToken",
      session.getAccessToken().getJwtToken()
    );
    sessionStorage.setItem("userName", session.getIdToken().payload.nickname);
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userName");
  };

  return (
    <AuthContext.Provider value={{ auth_login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
