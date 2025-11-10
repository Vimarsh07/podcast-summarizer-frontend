// ======================== src/pages/HomePage.jsx ========================
import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import PodcastsRoundedIcon from "@mui/icons-material/PodcastsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import RssFeedRoundedIcon from "@mui/icons-material/RssFeedRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem("access_token");

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.15) 100%)",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Chip
              icon={<PodcastsRoundedIcon />}
              label="Podcast Summarizer"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="h3" fontWeight={800}>
              Turn long podcasts into crisp, actionable summaries
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800 }}>
              Paste a podcast’s RSS feed, pick an episode, and let the app
              transcribe + summarize into structured insights you can skim
              in minutes.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {isAuthed ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/")}
                >
                  Go to My Podcasts
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<LoginRoundedIcon />}
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PersonAddAltRoundedIcon />}
                    onClick={() => navigate("/signup")}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* What it does / Who it's for */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: "100%" }} elevation={2}>
              <Stack spacing={1.5}>
                <AutoAwesomeRoundedIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  What the app does
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  It ingests podcast episodes from their RSS feed, performs
                  high-accuracy speech-to-text, and generates structured
                  summaries with <strong>Overview</strong>,{" "}
                  <strong>Key Takeaways</strong>,{" "}
                  <strong>Insights & Analysis</strong>, and{" "}
                  <strong>Outline</strong>.
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: "100%" }} elevation={2}>
              <Stack spacing={1.5}>
                <SummarizeRoundedIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Who should use it
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Busy learners, researchers, content creators, and teams
                  who need <em>fast</em> comprehension of long audio. Great for
                  staying on top of trends without spending hours listening.
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: "100%" }} elevation={2}>
              <Stack spacing={1.5}>
                <PlaylistAddRoundedIcon fontSize="large" color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  How it works
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  1) Add a podcast RSS feed.<br />
                  2) Pick an episode.<br />
                  3) Click <strong>Transcribe &amp; Summarize</strong>.<br />
                  We’ll process it and present a clean, readable result.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* How to find RSS feeds */}
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: { xs: 3, md: 4 } }} elevation={1}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <RssFeedRoundedIcon color="primary" />
              <Typography variant="h5" fontWeight={800}>
                How to find a podcast’s RSS feed
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                General approach
              </Typography>
              <Typography color="text.secondary">
                Look for the <strong>RSS</strong> link on the podcast’s website,
                show page, or help section. You can also search the web:
                <br />
                <code>“Podcast Name” + RSS feed</code>
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StepCard
                  icon={<SearchRoundedIcon />}
                  title="From the show website"
                  text="Most podcasts list their RSS on the official website or on their hosting provider page (e.g., Buzzsprout, Libsyn, Anchor/Spotify for Podcasters)."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StepCard
                  icon={<PodcastsRoundedIcon />}
                  title="Apple/Google directories"
                  text="Many directory pages link back to a website or host page where the RSS is published."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StepCard
                  icon={<RssFeedRoundedIcon />}
                  title="Direct RSS icon"
                  text="Look for the orange RSS icon. Copy the link address (it usually ends with .xml or /feed)."
                />
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary">
              Tip: If you can’t find it, ask the creator or check the hosting
              platform’s docs. Once you have the URL, paste it on the{" "}
              <strong>My Podcasts</strong> page to subscribe.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
              {isAuthed ? (
                <Button variant="contained" onClick={() => navigate("/")}>
                  Go to My Podcasts
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<LoginRoundedIcon />}
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddAltRoundedIcon />}
                    onClick={() => navigate("/signup")}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Container>

      {/* Footer-ish spacing */}
      <Container maxWidth="md" sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Built for people who learn by listening—powered by high-quality ASR and structured AI summaries.
        </Typography>
      </Container>
    </Box>
  );
}

function StepCard({ icon, title, text }) {
  return (
    <Paper sx={{ p: 2, height: "100%" }} elevation={0} variant="outlined">
      <Stack spacing={1.5}>
        <Box sx={{ "& svg": { fontSize: 28 } }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      </Stack>
    </Paper>
  );
}
