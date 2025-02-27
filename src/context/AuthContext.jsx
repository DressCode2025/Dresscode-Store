import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (token) {
      setUser({ token });
      if (storedUserData) {
        setUserData(storedUserData);
      }
    }
  }, []);

  const login = (roleType, token, storeId, userName, storeName) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("storeId", storeId);
    localStorage.setItem("userName", userName);
    localStorage.setItem("storeName", storeName);
    setUser({ token });
  };

  const UserInfo = (userName, roleType) => {
    const userData = { userName, roleType };
    setUserData(userData);
    // console.log(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logoutFunction = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setUserData({});
    localStorage.clear();
  };

  const value = {
    UserInfo,
    user,
    userData,
    login,
    logoutFunction,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
