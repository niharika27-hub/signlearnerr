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
      // Token is automatically sent via cookie (withCredentials: true)
      const data = await getProfile();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // API failed - user not authenticated
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth on provider mount
  useEffect(() => {
    init();
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      const user = data.user;
      // Token is automatically set as httpOnly cookie by backend
      // No need to store in localStorage

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
      // Account created successfully
      // DO NOT auto-login - user must login manually
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Signup failed";
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };
  // Google login action
const loginWithGoogle = async (token) => {
  setLoading(true);
  setError(null);
  try {
    // Token is already set as httpOnly cookie by backend
    // No need to store in localStorage
    
    // Fetch user profile (token sent automatically via cookie)
    const data = await getProfile();
    const user = data.user;
    
    setUser(user);
    setIsAuthenticated(true);
    setLoading(false);

    return { success: true, data };
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Google login failed";
    setError(errorMsg);
    setLoading(false);
    return { success: false, error: errorMsg };
  }
};

// AuthContext.Provider mein add karo:
// value={{ ..., loginWithGoogle }}

  // Logout action
  const logout = async () => {
    // Clear state immediately so user sees "not authenticated" right away
    setUser(null);
    setIsAuthenticated(false);
    // Token is in httpOnly cookie - only server can clear it

    // Try to notify backend to clear session (fire and forget)
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout API error (non-blocking):", error);
      // Continue even if API fails - client state is already cleared
    }

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
    loginWithGoogle,
    setUser: setUserInfo,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};