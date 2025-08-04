import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Protects routes by redirecting unauthenticated users to /login.
 * Checks for a JWT stored in localStorage under 'access_token'.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  if (!token) {
    // Redirect to login page, save current location for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists, render the protected child component
  return children;
}
