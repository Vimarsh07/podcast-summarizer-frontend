// ========================== src/components/ProtectedRoute.jsx ==========================
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Protects private routes by verifying if a user is authenticated.
 * Checks for JWT stored in localStorage under 'access_token'.
 * If not authenticated, redirects to /login and preserves the intended route
 * for post-login navigation.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  // If no token, redirect to login with saved location (for post-login redirect)
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists, render the protected content
  return children;
}
