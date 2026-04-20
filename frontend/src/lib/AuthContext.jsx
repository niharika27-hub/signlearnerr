import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, logoutUser, getProfile } from "./authApi";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from current session
  const init = async () => {
    setLoading(true);
    try {
      // Try to fetch fresh user profile from server
      const data = await getProfile();
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      // If API fails, check localStorage
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          setLoading(false);
        } catch {
          setIsAuthenticated(false);
          setLoading(false);
          setError(null);
        }
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        setError(null);
      }
    }
  };

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      const user = data.user;
      const token = data.token;

      // Store token in localStorage for API requests
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      setUser(user);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Signup action
  const signup = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signupUser(payload);
      const user = data.user;
      const token = data.token;

      // Store token in localStorage for API requests
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      setUser(user);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Signup failed";
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Logout action
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear token from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);

    return { success: true };
  };

  // Set user info
  const setUserInfo = (user) => setUser(user);

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    init,
    login,
    signup,
    logout,
    setUser: setUserInfo,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};