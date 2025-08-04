// src/App.js

import React from 'react';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Button } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';
import PodcastsPage from './components/PodcastsPage';
import PodcastsDetailsPage from './components/PodcastsDetailsPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Highlight “My Podcasts” tab when on / or /podcasts/*
  const currentTab =
    location.pathname === '/' || location.pathname.startsWith('/podcasts/')
      ? 0
      : false;

  function handleLogout() {
    localStorage.removeItem('access_token');
    navigate('/login', { replace: true });
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}
          >
            Podcast Summarizer
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
        <Tabs value={currentTab} centered>
          <Tab label="My Podcasts" component={Link} to="/" />
        </Tabs>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Routes>
          <Route
            path="/"
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </>
  );
}
