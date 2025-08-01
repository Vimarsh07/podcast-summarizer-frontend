import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, List, ListItem,
  ListItemText, Paper, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PodcastDetailsPage() {
  const { podcastName } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Retrieve stored podcasts from navigation state
  const allPodcasts = state?.podcasts || [];
  const decodedName = decodeURIComponent(podcastName);

  // Find the selected podcast and its episodes
  const podcast = allPodcasts.find(p => p.podcast_name === decodedName);
  const episodes = podcast?.episodes || [];

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h5" gutterBottom>
        {decodedName}
      </Typography>

      <Paper sx={{ p: 2, maxHeight: 400, overflowY: 'auto' }}>
        {episodes.length > 0 ? (
          <List>
            {episodes.map(ep => (
              <ListItem key={ep.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle1">{ep.episode_name}</Typography>
                <ListItemText
                  primary={ep.summary}
                  secondary={ep.transcript}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No episodes summaries available.</Typography>
        )}
      </Paper>
    </Box>
  );
}