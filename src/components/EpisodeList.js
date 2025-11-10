import React, { useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import EpisodeCard from "./EpisodeCard";
import toast from "react-hot-toast";

/**
 * EpisodeList
 * Displays a list of episode cards or a friendly message if empty.
 */
export default function EpisodeList({ episodes = [] }) {
  useEffect(() => {
    if (Array.isArray(episodes) && episodes.length === 0) {
      toast("No episodes found yet. Try fetching the latest ones!", {
        icon: "🎧",
      });
    }
  }, [episodes]);

  if (!Array.isArray(episodes) || episodes.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", mt: 4 }}
      >
        No episodes to display.
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 4 }}>
      {episodes.map((ep, idx) => (
        <EpisodeCard key={idx} url={ep.url} summary={ep.summary} />
      ))}
    </Stack>
  );
}
