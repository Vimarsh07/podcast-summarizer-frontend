import React from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import PodcastsPage from './components/PodcastsPage';
import PodcastsDetailsPage from './components/PodcastsDetailsPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignUpPage';

export default function App() {
  const location = useLocation();

  // Highlight "My Podcasts" tab when on root or details
  const currentTab = location.pathname === '/' || location.pathname.startsWith('/podcasts/')
    ? 0
    : false;

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
        </Toolbar>
        <Tabs value={currentTab} centered>
          <Tab label="My Podcasts" component={Link} to="/" />
        </Tabs>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Routes>
          {/* Landing defaults to PodcastsPage */}
          <Route path="/" element={<PodcastsPage />} />

          {/* Details for a specific podcast */}
          <Route path="/podcasts/:podcastName" element={<PodcastsDetailsPage />} />

          {/* Auth pages (if routing to login/signup directly) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Fallback: redirect any unknown path to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </>
  );
}