import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, Card, CardContent, Typography, Button, CircularProgress, TextField, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Home() {
  const { currentUser, logout, getUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = getUsers((userList) => {
      setUsers(userList);
      setFilteredUsers(userList);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [currentUser, getUsers]);

  // Search filter
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.displayName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  if (!currentUser) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Not logged in.</p>
        <Button component={Link} to="/login" variant="contained" color="primary">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Messages</h2>
        <Button onClick={logout} variant="outlined" color="error">Logout</Button>
      </div>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'gray', mr: 1 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: '#f5f5f5',
            }
          }}
        />
      </Box>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <CircularProgress />
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'gray', marginTop: 40 }}>
          <p>
            {searchQuery
              ? `No users found for "${searchQuery}"`
              : "No other users online."}
          </p>
          {!searchQuery && <p><strong>Open another tab and sign in with a different account!</strong></p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {filteredUsers.map((user) => (
            <Card key={user.id} component={Link} to={`/chat/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <CardContent style={{ textAlign: 'center', padding: 16 }}>
                <Avatar src={user.photoURL} alt={user.displayName} style={{ width: 60, height: 60, margin: '0 auto 12px' }} />
                <Typography variant="h6">{user.displayName || 'Unknown'}</Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {user.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.bio || 'Say hi!'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
