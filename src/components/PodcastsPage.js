import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button,
  Paper, List, ListItem, ListItemText,
  IconButton, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import {
  fetchSubscriptions,
  subscribePodcast,
  unsubscribePodcast
} from '../services/api';

export default function PodcastsPage() {
  const [title, setTitle] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [podcasts, setPodcasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setPodcasts(await fetchSubscriptions());
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!title || !feedUrl) return alert('Please fill both');
    try {
      await subscribePodcast(title, feedUrl);
      setTitle('');
      setFeedUrl('');
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm('Remove?')) return;
    try {
      await unsubscribePodcast(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>My Podcasts</Typography>

      <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <TextField
          label="RSS URL"
          value={feedUrl}
          onChange={e => setFeedUrl(e.target.value)}
          required
        />
        <Button type="submit" variant="contained">Add</Button>
      </Box>

      <Paper>
        <List>
          {podcasts.map(p => (
            <ListItem
              key={p.id}
              button
              onClick={() => navigate(`/podcasts/${p.id}`)}
              secondaryAction={
                <IconButton edge="end" onClick={e => handleDelete(p.id, e)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={p.title} secondary={p.feed_url} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
