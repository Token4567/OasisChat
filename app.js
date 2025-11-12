// app.js – Simple ID-based chat with WebSocket relay + AES encryption
const ws = new WebSocket('wss://echo.websocket.org'); // Public relay (echoes messages to all connected)
let roomId = null;
let key = null;
const $ = id => document.getElementById(id);

function addMessage(sender, text) {
  const div = document.createElement('div');
  div.className = `message ${sender === 'You' ? 'sent' : 'received'}`;
  div.textContent = text;
  $('#messages').appendChild(div);
  $('#messages').scrollTop = $('#messages').scrollHeight;
}

// Derive key from room ID (simple AES key)
function deriveKey(id) {
  return CryptoJS.SHA256(id).toString();
}

// Encrypt/decrypt with AES
function encrypt(text, keyStr) {
  return CryptoJS.AES.encrypt(text, keyStr).toString();
}
function decrypt(encrypted, keyStr) {
  const bytes = CryptoJS.AES.decrypt(encrypted, keyStr);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// WebSocket events
ws.onopen = () => console.log('Connected to relay');
ws.onmessage = (e) => {
  if (!roomId) return;
  try {
    const data = JSON.parse(e.data);
    if (data.room === roomId) {
      const text = decrypt(data.msg, key);
      addMessage('Partner', text);
    }
  } catch {}
};

// Create Room
$('#create').onclick = () => {
  roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  key = deriveKey(roomId);
  $('#myId').textContent = roomId;
  $('#myIdArea').classList.remove('hidden');
  $('#setup').classList.add('hidden');
  $('#chat').classList.remove('hidden');
  addMessage('System', 'Room created! Share the ID: ' + roomId);
};

// Join Room
$('#join').onclick = () => {
  const inputId = $('#roomId').value.trim().toUpperCase();
  if (!inputId) return alert('Enter a room ID');
  roomId = inputId;
  key = deriveKey(roomId);
  $('#setup').classList.add('hidden');
  $('#chat').classList.remove('hidden');
  addMessage('System', 'Joined room ' + roomId + '. Waiting for messages...');
};

// Copy ID
$('#copyId').onclick = () => {
  navigator.clipboard.writeText(roomId).then(() => {
    $('#copyId').textContent = 'Copied!';
    setTimeout(() => $('#copyId').textContent = 'Copy ID', 2000);
  });
};

// Send Message
$('#sendBtn').onclick = () => {
  const text = $('#msgInput').value.trim();
  if (!text || !roomId) return;
  const encrypted = encrypt(text, key);
  ws.send(JSON.stringify({ room: roomId, msg: encrypted }));
  addMessage('You', text);
  $('#msgInput').value = '';
};

$('#msgInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') $('#sendBtn').click();
});
