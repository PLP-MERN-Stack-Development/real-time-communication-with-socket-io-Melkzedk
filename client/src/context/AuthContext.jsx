import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        // Normalize _id to string (handles MongoDB $oid or id from localStorage)
        const normalizedUser = {
          ...parsedUser,
          _id: parsedUser._id?.$oid || parsedUser._id || parsedUser.id
        };

        setUser(normalizedUser);
        console.log("✅ AuthContext loaded user:", normalizedUser);
      } else {
        console.log("⚠️ No user found in localStorage");
      }
    } catch (err) {
      console.error("❌ Error parsing user from localStorage:", err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const login = (userData) => {
    const normalizedUser = {
      ...userData,
      _id: userData._id?.$oid || userData._id || userData.id
    };
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};
