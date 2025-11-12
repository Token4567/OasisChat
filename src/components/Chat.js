import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Avatar, TextField, IconButton, Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

export default function Chat() {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  const chatId = [currentUser?.uid, userId].sort().join('_');

  useEffect(() => {
    const fetchUser = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setOtherUser(userDoc.data());
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL || '',
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  if (!otherUser) return <div style={{ padding: 20 }}>Loading chat...</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <div style={{ padding: 12, backgroundColor: 'white', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar src={otherUser.photoURL} style={{ marginRight: 12 }} />
        <Typography variant="h6">{otherUser.displayName}</Typography>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>
            No messages yet. Say hi!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.uid === currentUser.uid ? 'flex-end' : 'flex-start',
                marginBottom: 8
              }}
            >
              <Box
                style={{
                  maxWidth: '70%',
                  padding: 10,
                  borderRadius: 18,
                  backgroundColor: msg.uid === currentUser.uid ? '#0084ff' : '#e4e6eb',
                  color: msg.uid === currentUser.uid ? 'white' : 'black'
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
                {msg.createdAt && (
                  <Typography variant="caption" style={{ opacity: 0.7, display: 'block', textAlign: 'right', marginTop: 4 }}>
                    {new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
              </Box>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 12, backgroundColor: 'white', borderTop: '1px solid #ddd' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            style={{ marginRight: 8 }}
          />
          <IconButton onClick={sendMessage} color="primary">
            <SendIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
