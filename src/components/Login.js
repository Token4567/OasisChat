import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const { signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Roboto, sans-serif'
    }}>
      <Box textAlign="center" p={5} bgcolor="white" borderRadius={3} boxShadow={3}>
        <Typography variant="h4" gutterBottom>OasisChat</Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          Connect with friends in real-time
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleSignIn}
          disabled={loading}
          style={{ backgroundColor: '#4285F4' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in with Google'}
        </Button>
      </Box>
    </div>
  );
}
