// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useToast } from "@/hooks/use-toast";

export function ProtectedRoute({ requireAdmin = false }) {
  const { currentUser, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    // You can replace this with a loading spinner component
    return <div>Loading...</div>;
  }

  // Check if user is authenticated
  if (!currentUser) {
    console.log("Cart Protect Hit");
    toast({
      title: "Please Log In",
      description: "You're not logged in, Please log in to continue with the purchase",
    });
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
