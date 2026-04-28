import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem("ideaAuth");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem("ideaAuth", JSON.stringify(data));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem("ideaAuth");
  };

  const updateUser = (data) => {
    setUserInfo(data);
    localStorage.setItem("ideaAuth", JSON.stringify(data));
  };

  const value = useMemo(
    () => ({
      userInfo,
      login,
      logout,
      updateUser,
    }),
    [userInfo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
