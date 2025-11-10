import React from "react";
import { Card, CardContent, Typography, Link } from "@mui/material";
import toast from "react-hot-toast";

/**
 * EpisodeCard
 * Displays episode link + summary.
 * Gracefully handles missing data and warns user if URL is invalid.
 */
export default function EpisodeCard({ url, summary }) {
  const handleOpenLink = (e) => {
    if (!url) {
      e.preventDefault();
      toast.error("No link available for this episode.");
      return;
    }
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      e.preventDefault();
      toast.error("Could not open episode link.");
    }
  };

  return (
    <Card sx={{ bgcolor: "grey.50" }}>
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {url ? (
            <Link
              href={url}
              target="_blank"
              rel="noopener"
              onClick={handleOpenLink}
              underline="hover"
            >
              {url.length > 60 ? `${url.slice(0, 60)}…` : url}
            </Link>
          ) : (
            <Typography variant="body2" color="text.disabled">
              No URL available
            </Typography>
          )}
        </Typography>

        <Typography
          variant="body1"
          sx={{ mt: 1, whiteSpace: "pre-line", wordBreak: "break-word" }}
        >
          {summary?.trim() || "No summary available for this episode."}
        </Typography>
      </CardContent>
    </Card>
  );
}
