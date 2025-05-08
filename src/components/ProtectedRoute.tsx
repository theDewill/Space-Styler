// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ requireAdmin = false }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // You can replace this with a loading spinner component
    return <div>Loading...</div>;
  }

  // Check if user is authenticated
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  // Check if admin route and user is admin
  if (requireAdmin && currentUser.role !== "admin") {
    // Redirect to unauthorized page if not admin
    return <Navigate to="/" replace />;
  }

  // Render the protected route
  return <Outlet />;
}
