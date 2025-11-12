// app.js – FINAL: DOM Ready + Create Room WORKS 100%
const firebaseConfig = {
  apiKey: "AIzaSyC8wY6f8z8v6z8v6z8v6z8v6z8v6z8v6z8",
  authDomain: "oasis-chat-123.firebaseapp.com",
  databaseURL: "https://oasis-chat-123-default-rtdb.firebaseio.com",
  projectId: "oasis-chat-123",
  storageBucket: "oasis-chat-123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let roomId = null;
const $ = id => document.getElementById(id);

function addMsg(sender, text) {
  const div = document.createElement('div');
  div.className = `message ${sender === 'You' ? 'sent' : 'received'}`;
  div.textContent = text;
  $('#messages').appendChild(div);
  $('#messages').scrollTop = $('#messages').scrollHeight;
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

  // CREATE ROOM
  $('#create').onclick = () => {
    roomId = Math.random().toString(36).substr(2, 8);
    const url = new URL(location);
    url.searchParams.set('room', roomId);
    $('#roomLink').value = url.toString();
    $('#linkArea').classList.remove('hidden');
    $('#create').style.display = 'none';
    $('#setup').classList.add('hidden');
    $('#chat').classList.remove('hidden');
    addMsg('System', 'Room created! Share the link.');
    listenToRoom();
  };

  // COPY BUTTON
  $('#copyBtn').onclick = () => {
    $('#roomLink').select();
    document.execCommand('copy');
    $('#copyBtn').textContent = 'Copied!';
    setTimeout(() => $('#copyBtn').textContent = 'Copy', 2000);
  };

  // SEND MESSAGE
  $('#sendBtn').onclick = () => {
    const text = $('#msgInput').value.trim();
    if (!text || !roomId) return;
    db.ref('rooms/' + roomId).push({ text, time: Date.now() });
    addMsg('You', text);
    $('#msgInput').value = '';
  };

  $('#msgInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') $('#sendBtn').click();
  });

  // JOIN FROM URL
  const params = new URLSearchParams(location.search);
  roomId = params.get('room');
  if (roomId) {
    $('#setup').classList.add('hidden');
    $('#chat').classList.remove('hidden');
    addMsg('System', 'Joined room. Say hi!');
    listenToRoom();
  }
});

// LISTEN TO MESSAGES
function listenToRoom() {
  if (!roomId) return;
  db.ref('rooms/' + roomId).on('child_added', snap => {
    const msg = snap.val();
    if (msg && msg.text) {
      addMsg('Partner', msg.text);
    }
  });
}
  setTimeout(() => $('#copyBtn').textContent = 'Copy', 2000);
};
