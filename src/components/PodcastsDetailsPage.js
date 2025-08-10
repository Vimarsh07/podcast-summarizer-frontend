// src/pages/PodcastDetailsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Button, Typography, Paper,
  List, ListItem, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Stack, Chip, Avatar
} from "@mui/material";
import {
  getPodcast,
  fetchEpisodes,
  fetchLatestMetadata,              // updated API
  transcribeAndSummarizeEpisode     // new API
} from "../services/api";

// ---------- helpers ----------
function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}
function fmtDuration(seconds) {
  if (seconds === null || seconds === undefined) return "—";
  const s = Number(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}h ${m}m` : `${m}m ${sec}s`;
}
function statusColor(status) {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED": return "success";
    case "TRANSCRIBING": return "warning";
    case "QUEUED": return "info";
    case "FAILED": return "error";
    default: return "default";
  }
}
function stripHtml(html) {
  if (!html) return "";
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || el.innerText || "").trim();
}
function clampLines(lines = 2) {
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lines,
    overflow: "hidden",
  };
}

export default function PodcastDetailsPage() {
  const { podcastId } = useParams();
  const navigate = useNavigate();

  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  // polling
  const pollTimer = useRef(null);
  const startPoll = useCallback(() => {
    if (pollTimer.current) return;
    pollTimer.current = setInterval(async () => {
      try {
        const fresh = await fetchEpisodes(podcastId);
        setEpisodes(fresh);
        const stillRunning = fresh.some(e =>
          ["QUEUED", "TRANSCRIBING"].includes((e.transcript_status || "").toUpperCase())
        );
        if (!stillRunning) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);
  }, [podcastId]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  // loaders
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

  useEffect(() => {
    loadPodcast();
    loadEpisodes();
  }, [loadPodcast, loadEpisodes]);

  async function handleFetchLatest() {
    setLoading(true);
    try {
      await fetchLatestMetadata(podcastId, 10); // queues metadata ingest
      await loadEpisodes();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTranscribe(ep) {
    try {
      // optimistic: mark as queued
      setEpisodes(list =>
        list.map(x => (x.id === ep.id ? { ...x, transcript_status: "QUEUED" } : x))
      );
      await transcribeAndSummarizeEpisode(ep.id, { summary_words: 900, force: false });
      startPoll();
    } catch (e) {
      alert(e.message);
      loadEpisodes();
    }
  }

  function handleOpenDialog(title, content) {
    setDialogTitle(title);
    setDialogContent(content || "(empty)");
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
        {loading ? "Loading…" : "Fetch Latest Metadata"}
      </Button>

      <Paper>
        <List>
          {episodes.length === 0 && (
            <ListItem>
              <ListItemText primary="No episodes found." />
            </ListItem>
          )}

          {episodes.map((ep, idx) => {
            const status = (ep.transcript_status || "NOT_REQUESTED").toUpperCase();
            const done = status === "COMPLETED";
            const working = ["QUEUED", "TRANSCRIBING"].includes(status);

            return (
              <React.Fragment key={ep.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ flexDirection: "column", alignItems: "stretch", py: 2 }}
                >
                  {/* Row: index + avatar + title + status chip */}
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", minWidth: 28, textAlign: "right" }}
                    >
                      {idx + 1}.
                    </Typography>

                    {ep.image_url ? (
                      <Avatar
                        variant="rounded"
                        src={ep.image_url}
                        alt={ep.title}
                        sx={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
                        {ep.title ? ep.title.charAt(0) : "E"}
                      </Avatar>
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, ...clampLines(1), flex: 1, minWidth: 0 }}
                        >
                          {ep.title || "Untitled episode"}
                        </Typography>
                        <Chip
                          size="small"
                          label={status}
                          color={statusColor(status)}
                          variant={status === "NOT_REQUESTED" ? "outlined" : "filled"}
                          sx={{ ml: 1, flexShrink: 0 }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {fmtDate(ep.pub_date)} • {fmtDuration(ep.duration_seconds)}
                      </Typography>

                      {!!ep.summary && (
                        <Typography variant="body2" sx={{ mt: 0.5, ...clampLines(3) }}>
                          {stripHtml(ep.summary)}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleTranscribe(ep)}
                      disabled={working || done || !ep.audio_url}
                    >
                      {working ? "Processing…" : done ? "Completed" : "Transcribe & Summarize"}
                    </Button>

                    <Button
                      size="small"
                      disabled={!done || !ep.summary}
                      onClick={() => handleOpenDialog("Summary", stripHtml(ep.summary))}
                    >
                      View Summary
                    </Button>

                    <Button
                      size="small"
                      disabled={!done || !ep.transcript}
                      onClick={() => handleOpenDialog("Transcript", ep.transcript)}
                    >
                      View Transcript
                    </Button>
                  </Stack>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText
            component="pre"
            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
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
