import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem("authToken");
      
      if (storedToken) {
        setToken(storedToken);
        // Try to fetch user profile to validate token
        try {
          const profile = await Api.getProfile();
          setUser(profile);
          setIsGuest(false);
        } catch (error) {
          // Token invalid or expired
          await logout();
        }
      } else {
        // No token, user is guest
        setIsGuest(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsGuest(true);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await Api.login(email, password);
      const { token: authToken, user: userData } = response;
      
      // Store token
      await AsyncStorage.setItem("authToken", authToken);
      setToken(authToken);
      setUser(userData);
      setIsGuest(false);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await Api.register(email, password, name);
      const { token: authToken, user: userData } = response;
      
      // Store token
      await AsyncStorage.setItem("authToken", authToken);
      setToken(authToken);
      setUser(userData);
      setIsGuest(false);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
      setIsGuest(true);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isGuest,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
