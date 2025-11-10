// src/components/LoginPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../services/api";
import { humanizeApiError } from "../services/errorMap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Prefer returning to the page user came from; otherwise go to /podcasts
  const from = location.state?.from?.pathname || "/podcasts";

  // If already logged in and someone hits /login, bounce to /podcasts
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      navigate("/podcasts", { replace: true });
    }
  }, [navigate]);

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Client-side checks
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await loginUser({ email: email.trim(), password });
      localStorage.setItem("access_token", access_token);

      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(
        humanizeApiError(err, "Login failed. Please check your credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>

      <Box component="form" onSubmit={handleLogin} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </Button>
      </Box>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body2">
          Don’t have an account?{" "}
          <MuiLink component={RouterLink} to="/signup">
            Sign up
          </MuiLink>
        </Typography>
      </Box>
    </Paper>
  );
}
