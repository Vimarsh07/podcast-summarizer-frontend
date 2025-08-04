import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Paper,
  List, ListItem, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Stack
} from '@mui/material';
import { getPodcast, fetchEpisodes, fetchLatestEpisode } from '../services/api';

export default function PodcastDetailsPage() {
  const { podcastId } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');

  // Stable loader functions
  const loadPodcast = useCallback(async () => {
    try {
      setPodcast(await getPodcast(podcastId));
    } catch (e) {
      alert(e.message);
    }
  }, [podcastId]);

  const loadEpisodes = useCallback(async () => {
    setLoading(true);
    try {
      setEpisodes(await fetchEpisodes(podcastId));
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }, [podcastId]);

  // safe to list them here now
  useEffect(() => {
    loadPodcast();
    loadEpisodes();
  }, [loadPodcast, loadEpisodes]);

  async function handleFetchLatest() {
    setLoading(true);
    try {
      await fetchLatestEpisode(podcastId);
      await loadEpisodes();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(title, content) {
    setDialogTitle(title);
    setDialogContent(content);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  if (!podcast) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Typography variant="h4" gutterBottom>
        {podcast.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {podcast.feed_url}
      </Typography>

      <Button
        variant="contained"
        onClick={handleFetchLatest}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Loading…' : 'Fetch Latest Episode'}
      </Button>

      <Paper>
        <List>
          {episodes.length === 0 && (
            <ListItem>
              <ListItemText primary="No episodes found." />
            </ListItem>
          )}

          {episodes.map((ep, idx) => (
            <React.Fragment key={ep.id}>
              <ListItem
                alignItems="flex-start"
                sx={{ flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {idx + 1}.
                  </Typography>
                  <Typography variant="subtitle1">{ep.title}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => handleOpenDialog('Summary', ep.summary)}
                  >
                    View Summary
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleOpenDialog('Transcript', ep.transcript)}
                  >
                    View Transcript
                  </Button>
                </Stack>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText
            component="pre"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
