import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const AuthContext = createContext(null);
AuthContext.displayName = "AuthContext";

const BASE_API_URL = "https://laundromat-server.vercel.app/api/v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/auth/me`, {
        headers: {
          "X-Client-Type": "web",
        },
        withCredentials: true,
      });

      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${BASE_API_URL}/auth/logout`, null, {
        withCredentials: true,
        headers: {
          "X-Client-Type": "web",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
  };

  const isLoggedIn = !!user;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <ArrowPathIcon className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-3 text-lg font-medium text-blue-600">
          Checking session...
        </p>
      </div>
    );
  }

  const value = { user, isLoggedIn, login, logout, checkAuthStatus };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth should be used inside the AuthProvider.");
  }

  return context;
}

AuthProvider.displayName = "/src/context/index.jsx";

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
