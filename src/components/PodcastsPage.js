import React, { useState } from 'react';
import {
  Box, Typography, Stack,
  TextField, Button,
  Paper, TableContainer, Table,
  TableHead, TableRow, TableCell,
  TableBody, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState([]);
  const [podcastName, setPodcastName] = useState('');
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!podcastName.trim()) return;
    const newItem = {
      id: Date.now(),
      podcast_name: podcastName.trim(),
      episodes: []  // will hold summaries/transcripts
    };
    setPodcasts(prev => [...prev, newItem]);
    setPodcastName('');
  };

  const handleDelete = id => {
    setPodcasts(prev => prev.filter(item => item.id !== id));
  };

  const handleRowClick = name => {
    navigate(`/podcasts/${encodeURIComponent(name)}`, { state: { podcasts } });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My Podcasts</Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Podcast Name"
          value={podcastName}
          onChange={e => setPodcastName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </Stack>

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Podcast Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {podcasts.map(p => (
              <TableRow
                key={p.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(p.podcast_name)}
              >
                <TableCell>{p.podcast_name}</TableCell>
                <TableCell align="right" onClick={e => e.stopPropagation()}>
                  <IconButton onClick={() => handleDelete(p.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}