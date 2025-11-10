// ============================== src/App.js ==============================
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
} from "@mui/material";

import ProtectedRoute from "./components/ProtectedRoute";
import PodcastsPage from "./components/PodcastsPage";
import PodcastsDetailsPage from "./components/PodcastsDetailsPage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import HomePage from "./pages/HomePage";

// Toaster
import AppToaster from "./components/Toaster";
import toast from "react-hot-toast";

/**
 * Wrapper for "/" that shows the public Home when logged out,
 * and redirects to /podcasts if the user is already authenticated.
 */
function RootRoute() {
  const hasToken = !!localStorage.getItem("access_token");
  return hasToken ? <Navigate to="/podcasts" replace /> : <HomePage />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Tabs: 0 = Home, 1 = My Podcasts
  const currentTab =
    location.pathname === "/"
      ? 0
      : location.pathname.startsWith("/podcasts")
      ? 1
      : false;

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/signup";
  const hasToken = !!localStorage.getItem("access_token");

  function handleLogout() {
    localStorage.removeItem("access_token");
    toast.success("Logged out");
    navigate("/login", { replace: true });
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}
          >
            Podcast Summarizer
          </Typography>

          {/* Hide Logout on auth pages; show only if logged in */}
          {!isAuthRoute && hasToken && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>

        <Tabs value={currentTab} centered>
          <Tab label="Home" component={Link} to="/" />
          <Tab label="My Podcasts" component={Link} to="/podcasts" />
        </Tabs>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Routes>
          {/* Public landing or redirect to /podcasts if already logged in */}
          <Route path="/" element={<RootRoute />} />

          {/* Protected routes */}
          <Route
            path="/podcasts"
            element={
              <ProtectedRoute>
                <PodcastsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/podcasts/:podcastId"
            element={
              <ProtectedRoute>
                <PodcastsDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>

      {/* Toasts */}
      <AppToaster />
    </>
  );
}
