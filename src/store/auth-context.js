import React, { useState, useEffect, useCallback } from "react";
let logoutTimer;
const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remaningTime = adjExpirationTime - currentTime;
  return remaningTime;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const expirationTime = localStorage.getItem("expirationTime");

  const remaningTime = calculateRemainingTime(expirationTime);

  if (remaningTime <= 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    return null;
  }

  return { token: storedToken, remaningTime };
};

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  let initialToken;

  if (tokenData) {
    initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken);
  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);

    const remaningTime = calculateRemainingTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remaningTime);
  };

  useEffect(() => {
    console.log("useEffect");
    console.log(tokenData);
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.remaningTime);
    }
  }, [tokenData, logoutHandler]);

  const contexValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contexValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
