// src/components/SignupPage.js
import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../services/api';   // ← import your API helper

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSignup = async e => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    try {
      // call your backend
      await signupUser({ email, password });
      // on success, go to login
      navigate('/login', { replace: true });
    } catch (err) {
      // show any error returned by the API
      alert('Signup failed: ' + err.message);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>Sign Up</Typography>
      <Box component="form" onSubmit={handleSignup} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Sign Up
        </Button>
      </Box>
    </Paper>
  );
}
