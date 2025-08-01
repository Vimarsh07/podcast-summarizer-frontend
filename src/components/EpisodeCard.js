import React from 'react';
import { Card, CardContent, Typography, Link } from '@mui/material';

export default function EpisodeCard({ url, summary }) {
  return (
    <Card sx={{ bgcolor: 'grey.50' }}>
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          <Link href={url} target="_blank" rel="noopener">{url}</Link>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>{summary}</Typography>
      </CardContent>
    </Card>
  );
}