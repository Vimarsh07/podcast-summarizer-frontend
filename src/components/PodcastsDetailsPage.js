// ======================== src/pages/PodcastDetailsPage.jsx ========================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  getPodcast,
  fetchEpisodes, // now returns { items, page, page_size, total, total_pages }
  fetchLatestMetadata, // queues metadata ingest
  transcribeAndSummarizeEpisode, // POST transcribe
  getEpisodeDetail, // fetch full (summary + transcript) — also clears is_new server-side
  resetEpisodeTranscription,
  resummarizeEpisode 
} from "../services/api";

// ---------- helpers (missing earlier—added back) ----------
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
    case "COMPLETED":
      return "success";
    case "TRANSCRIBING":
      return "warning";
    case "QUEUED":
      return "info";
    case "FAILED":
      return "error";
    default:
      return "default";
  }
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

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // dialog state
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);

  const [cancelingId, setCancelingId] = useState(null);
  const [resummarizingId, setResummarizingId] = useState(null);

  // polling (merge status only)
  const pollTimer = useRef(null);
  const startPoll = useCallback(() => {
    if (pollTimer.current) return;
    pollTimer.current = setInterval(async () => {
      try {
        const fresh = await fetchEpisodes(podcastId, { page: 1, pageSize });
        const freshItems = fresh.items || fresh; // guard if API temporarily returns array
        // merge transcript_status for any items we already have
        setEpisodes((prev) => {
          const byId = new Map(prev.map((e) => [e.id, e]));
          for (const e of freshItems) {
            if (byId.has(e.id)) {
              const old = byId.get(e.id);
              byId.set(e.id, {
                ...old,
                transcript_status: e.transcript_status,
              });
            }
          }
          return Array.from(byId.values());
        });
        const stillRunning = freshItems.some((e) =>
          ["QUEUED", "TRANSCRIBING"].includes(
            (e.transcript_status || "").toUpperCase()
          )
        );
        if (!stillRunning) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }
      } catch {}
    }, 3000);
  }, [podcastId, pageSize]);

  useEffect(
    () => () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    },
    []
  );

  // loaders
  const loadPodcast = useCallback(async () => {
    try {
      setPodcast(await getPodcast(podcastId));
    } catch (e) {
      alert(e.message);
    }
  }, [podcastId]);

  const loadEpisodes = useCallback(
    async (p = 1, { replace } = { replace: true }) => {
      setLoading(true);
      try {
        const data = await fetchEpisodes(podcastId, { page: p, pageSize });
        const items = data.items || data; // guard for old shape
        if (replace) {
          setEpisodes(items);
        } else {
          setEpisodes((prev) => [
            ...prev,
            ...items.filter((x) => !prev.some((y) => y.id === x.id)),
          ]);
        }
        setPage(data.page ?? p);
        setTotalPages(data.total_pages ?? 1);
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    },
    [podcastId, pageSize]
  );

  useEffect(() => {
    loadPodcast();
    loadEpisodes(1, { replace: true });
  }, [loadPodcast, loadEpisodes]);

  async function handleFetchLatest() {
    setLoading(true);
    try {
      await fetchLatestMetadata(podcastId, 10);
      await loadEpisodes(1, { replace: true });
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTranscribe(ep) {
    try {
      setEpisodes((list) =>
        list.map((x) =>
          x.id === ep.id ? { ...x, transcript_status: "QUEUED" } : x
        )
      );
      await transcribeAndSummarizeEpisode(ep.id, {
        summary_words: 900,
        force: false,
      });
      startPoll();
    } catch (e) {
      alert(e.message);
      loadEpisodes(page, { replace: false });
    }
  }

  async function handleCancelTranscription(ep) {
    if (
      !window.confirm("Stop current transcription and reset to NOT_REQUESTED?")
    )
      return;

    console.log("🛑 [Cancel] start", { id: ep.id });
    setCancelingId(ep.id);

    try {
      const res = await resetEpisodeTranscription(ep.id, true); // clear_outputs=true
      console.log("✅ [Cancel] API success", res);

      // Only update UI *AFTER* server confirms
      setEpisodes((list) =>
        list.map((x) =>
          x.id === ep.id
            ? {
                ...x,
                transcript_status: (res.transcript_status || "").toUpperCase(),
              }
            : x
        )
      );

      // stop polling (optional)
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
        console.log("🧭 [Cancel] polling stopped");
      }
    } catch (e) {
      console.error("💥 [Cancel] API error:", e);
      alert(e.message || "Failed to cancel transcription");
      // Pull server truth to undo any stale UI
      await loadEpisodes(page, { replace: true });
    } finally {
      setCancelingId(null);
      console.log("🧩 [Cancel] end", { id: ep.id });
    }
  }

  async function handleResummarize(ep) {
  if (!window.confirm("Re-generate the summary from the existing transcript?")) return;
  setResummarizingId(ep.id);
  try {
    await resummarizeEpisode(ep.id, { summary_words: 900 });
    // Option A: Immediately fetch the new summary dialog
    const full = await getEpisodeDetail(ep.id);
    setDialogTitle("Summary");
    setDialogContent(full.summary || "(empty)");
    setOpen(true);
  } catch (e) {
    alert(e.message);
  } finally {
    setResummarizingId(null);
  }
}


  async function openSummary(ep) {
    setDialogTitle("Summary");
    setDialogContent("");
    setDialogLoading(true);
    setOpen(true);
    try {
      const full = await getEpisodeDetail(ep.id);
      setDialogContent(full.summary || "(empty)");
      // reflect server-side is_new clearing
      setEpisodes((list) =>
        list.map((x) => (x.id === ep.id ? { ...x, is_new: false } : x))
      );
    } catch (e) {
      setDialogContent(e.message || "Failed to load summary.");
    } finally {
      setDialogLoading(false);
    }
  }

  async function openTranscript(ep) {
    setDialogTitle("Transcript");
    setDialogContent("");
    setDialogLoading(true);
    setOpen(true);
    try {
      const full = await getEpisodeDetail(ep.id);
      setDialogContent(full.transcript || "(empty)");
      setEpisodes((list) =>
        list.map((x) => (x.id === ep.id ? { ...x, is_new: false } : x))
      );
    } catch (e) {
      setDialogContent(e.message || "Failed to load transcript.");
    } finally {
      setDialogLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
  }

  async function handleLoadMore() {
    if (page < totalPages && !loading) {
      await loadEpisodes(page + 1, { replace: false });
    }
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

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Button
          variant="contained"
          onClick={handleFetchLatest}
          disabled={loading}
        >
          {loading ? "Loading…" : "Fetch Latest Metadata"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Page {page} / {totalPages}
        </Typography>
      </Stack>

      <Paper>
        <List>
          {episodes.length === 0 && (
            <ListItem>
              <ListItemText primary="No episodes found." />
            </ListItem>
          )}

          {episodes.map((ep, idx) => {
            const status = (
              ep.transcript_status || "NOT_REQUESTED"
            ).toUpperCase();
            const done = status === "COMPLETED";
            const working = ["QUEUED", "TRANSCRIBING"].includes(status);
            const globalIndex = (page - 1) * pageSize + idx + 1;

            return (
              <React.Fragment key={ep.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ flexDirection: "column", alignItems: "stretch", py: 2 }}
                >
                  {/* Row: index + avatar + title + status chips */}
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        minWidth: 36,
                        textAlign: "right",
                      }}
                    >
                      {globalIndex}.
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
                          sx={{
                            fontWeight: 600,
                            ...clampLines(1),
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {ep.title || "Untitled episode"}
                        </Typography>

                        {/* NEW badge */}
                        {ep.is_new && (
                          <Chip
                            size="small"
                            color="primary"
                            label="NEW"
                            sx={{ ml: 0.5 }}
                          />
                        )}

                        <Chip
                          size="small"
                          label={status}
                          color={statusColor(status)}
                          variant={
                            status === "NOT_REQUESTED" ? "outlined" : "filled"
                          }
                          sx={{ ml: 1, flexShrink: 0 }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.25 }}
                      >
                        {fmtDate(ep.pub_date)} •{" "}
                        {fmtDuration(ep.duration_seconds)}
                      </Typography>

                      {ep.meta_summary && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.75, ...clampLines(3) }}
                        >
                          {ep.meta_summary}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {/* Actions */}
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleTranscribe(ep)}
                      disabled={working || done}
                    >
                      {working
                        ? "Processing…"
                        : done
                        ? "Completed"
                        : "Transcribe & Summarize"}
                    </Button>
                    {working && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelTranscription(ep)}
                        disabled={cancelingId === ep.id}
                        startIcon={
                          cancelingId === ep.id ? (
                            <CircularProgress size={14} />
                          ) : null
                        }
                      >
                        {cancelingId === ep.id ? "Cancelling…" : "Cancel"}
                        
                      </Button>
                    )}

                    {/* Re-summarize when completed */}
                    {done && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleResummarize(ep)}
                        startIcon={
                          resummarizingId === ep.id ? (
                            <CircularProgress size={14} />
                          ) : null
                        }
                        disabled={resummarizingId === ep.id}
                      >
                        {resummarizingId === ep.id
                          ? "Re-summarizing…"
                          : "Re-Summarize"}
                      </Button>
                    )}

                    <Button
                      size="small"
                      disabled={!done}
                      onClick={() => openSummary(ep)}
                    >
                      View Summary
                    </Button>

                    <Button
                      size="small"
                      disabled={!done}
                      onClick={() => openTranscript(ep)}
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

      {/* Load more */}
      {page < totalPages && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          {dialogLoading ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading…</Typography>
            </Stack>
          ) : (
            <DialogContentText
              component="pre"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {dialogContent}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
