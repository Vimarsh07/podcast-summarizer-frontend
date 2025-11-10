// src/components/PodcastsPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  fetchSubscriptions,
  subscribePodcast,
  unsubscribePodcast,
} from "../services/api";
import { humanizeApiError } from "../services/errorMap";

export default function PodcastsPage() {
  const [title, setTitle] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchSubscriptions();
      setPodcasts(data || []);
    } catch (e) {
      toast.error(humanizeApiError(e, "Failed to load subscriptions."));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (adding) return;

    if (!title.trim() || !feedUrl.trim()) {
      toast.error("Please enter a title and RSS URL.");
      return;
    }

    setAdding(true);
    try {
      await subscribePodcast(title.trim(), feedUrl.trim());
      toast.success("Subscribed! Fetching latest episodes…");
      setTitle("");
      setFeedUrl("");
      await load();
    } catch (e) {
      toast.error(humanizeApiError(e, "Could not subscribe to this feed."));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (removingId) return;

    setRemovingId(id);
    try {
      await unsubscribePodcast(id);
      toast.success("Removed subscription.");
      await load();
    } catch (e) {
      toast.error(humanizeApiError(e, "Failed to remove subscription."));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        My Podcasts
      </Typography>

      <Box
        component="form"
        onSubmit={handleAdd}
        sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}
      >
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          size="small"
        />
        <TextField
          label="RSS URL"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          required
          size="small"
          sx={{ minWidth: 320 }}
        />
        <Button type="submit" variant="contained" disabled={adding}>
          {adding ? "Adding…" : "Add"}
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : podcasts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">
              No subscriptions yet. Paste an RSS feed URL above to get started.
            </Typography>
          </Box>
        ) : (
          <List>
            {podcasts.map((p) => (
              <ListItem
                key={p.id}
                button
                onClick={() => navigate(`/podcasts/${p.id}`)}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => handleDelete(p.id, e)}
                    disabled={removingId === p.id}
                    aria-label="remove"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={p.title || "Untitled podcast"}
                  secondary={p.feed_url}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
