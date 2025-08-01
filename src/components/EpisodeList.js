import React from 'react';
import { Stack } from '@mui/material';
import EpisodeCard from './EpisodeCard';

export default function EpisodeList({ episodes }) {
  if (!episodes.length) return null;
  return (
    <Stack spacing={2} sx={{ mt: 4 }}>
      {episodes.map((ep, idx) => (
        <EpisodeCard key={idx} url={ep.url} summary={ep.summary} />
      ))}
    </Stack>
  );
}