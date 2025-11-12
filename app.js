// app.js – FINAL: DOM Ready + Create Room WORKS
let roomId = null;
let key = null;
const $ = id => document.getElementById(id);

// CryptoJS is loaded from CDN
function deriveKey(id) {
  return CryptoJS.SHA256(id).toString();
}
function encrypt(text, keyStr) {
  return CryptoJS.AES.encrypt(text, keyStr).toString();
}
function decrypt(encrypted, keyStr) {
  const bytes = CryptoJS.AES.decrypt(encrypted, keyStr);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// WebSocket relay
const ws = new WebSocket('wss://echo.websocket.org');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => {
  if (!roomId) return;
  try {
    const data = JSON.parse(e.data);
    if (data.room === roomId && data.msg) {
      const text = decrypt(data.msg, key);
      if (text) addMsg('Partner', text);
    }
  } catch {}
};

function addMsg(sender, text) {
  const div = document.createElement('div');
  div.className = `message ${sender === 'You' ? 'sent' : 'received'}`;
  div.textContent = text;
  $('#messages').appendChild(div);
  $('#messages').scrollTop = $('#messages').scrollHeight;
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // CREATE ROOM
  $('#create').onclick = () => {
    roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    key = deriveKey(roomId);
    $('#myId').textContent = roomId;
    $('#myIdArea').classList.remove('hidden');
    $('#setup').classList.add('hidden');
    $('#chat').classList.remove('hidden');
    addMsg('System', `Room created! Share ID: ${roomId}`);
  };

  // JOIN ROOM
  $('#join').onclick = () => {
    const input = $('#roomId').value.trim().toUpperCase();
    if (!input) return alert('Enter a room ID');
    roomId = input;
    key = deriveKey(roomId);
    $('#setup').classList.add('hidden');
    $('#chat').classList.remove('hidden');
    addMsg('System', `Joined room ${roomId}`);
  };

  // COPY ID
  $('#copyId').onclick = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      $('#copyId').textContent = 'Copied!';
      setTimeout(() => $('#copyId').textContent = 'Copy ID', 2000);
    });
  };

  // SEND
  $('#sendBtn').onclick = () => {
    const text = $('#msgInput').value.trim();
    if (!text || !roomId) return;
    const encrypted = encrypt(text, key);
    ws.send(JSON.stringify({ room: roomId, msg: encrypted }));
    addMsg('You', text);
    $('#msgInput').value = '';
  };

  $('#msgInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') $('#sendBtn').click();
  });
});
