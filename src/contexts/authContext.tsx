// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { db } from "@/../fb-config"; // Path to your firebase config file
import { fetchDocumentsByCriteria } from "@/../fbcodes";
import { doc, getDoc } from "firebase/firestore";
import { compare } from "bcryptjs";

const AuthContext = createContext({
  currentUser: null,
  authCheck: async () => ({ authenticated: false, error: "Context not initialized" }),
  logout: () => true,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Your custom auth check function that verifies against your collection

  async function authCheck(
    email: string,
    password: string,
  ): Promise<{
    authenticated: boolean;
    userId?: string;
    role?: string;
    error?: string;
  }> {
    try {
      // Find user document by username
      const users = await fetchDocumentsByCriteria("f_users", { email });

      // Get the user document
      const user = users[0];

      // Compare provided password with stored hash
      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        return {
          authenticated: false,
          error: "Invalid password",
        };
      }

      // Authentication successful, return user info
      setCurrentUser({
        email: user.email,
        name: user.name,
        role: user.role,
        // Add other relevant user data
      });
      return {
        authenticated: true,
        userId: user.id,
        role: user.role,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        authenticated: false,
        error: "Authentication failed",
      };
    }
  }

  function logout() {
    setCurrentUser(null);
    // Clear any auth tokens from localStorage/sessionStorage
    localStorage.removeItem("authToken");
    return true;
  }

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        // Check localStorage/sessionStorage for stored credentials
        const storedUser = JSON.parse(localStorage.getItem("authUser"));
        const storedToken = localStorage.getItem("authToken");

        if (storedUser && storedToken) {
          // Verify the token is still valid with your backend
          // This could be a call to verify the token or check the user still exists
          const userRef = doc(db, "f_users", storedUser.email);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setCurrentUser(storedUser);
          } else {
            localStorage.removeItem("authUser");
            localStorage.removeItem("authToken");
          }
        }
      } catch (error) {
        console.error("Error checking stored auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const value = {
    currentUser,
    authCheck,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
