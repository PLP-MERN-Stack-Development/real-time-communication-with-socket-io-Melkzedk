import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createSocket } from '../socket/socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

export default function Chat() {
const { user } = useContext(AuthContext);
const [socket, setSocket] = useState(null);
const [messages, setMessages] = useState([]);
const [typingUsers, setTypingUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
if (!user) return;

// Create socket connection
const s = createSocket({ userId: user.id, username: user.username });
setSocket(s);

// When connected
s.on('connect', () => {
  console.log('✅ Connected to socket:', s.id);
  s.emit('join', { userId: user.id, username: user.username, room: 'global' });
});

// Fetch existing messages
const fetchMessages = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/messages');
    const data = await res.json();
    setMessages(data);
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err);
  } finally {
    setLoading(false);
  }
};

fetchMessages();

// Listen for new messages
s.on('newMessage', (message) => {
  setMessages((prev) => [...prev, message]);
});

// Typing indicator
s.on('typing', ({ username }) => {
  setTypingUsers((prev) => [...new Set([...prev, username])]);
  setTimeout(() => {
    setTypingUsers((prev) => prev.filter((u) => u !== username));
  }, 2000);
});

// Presence updates
s.on('presence', (users) => {
  console.log('👥 Online users:', users);
});

// Cleanup on unmount
return () => s.disconnect();


}, [user]);

const sendMessage = async (text) => {
if (!socket || !user) return;

const payload = {
  room: 'global',
  from: user.id,
  text,
};

try {
  // Emit via socket
  socket.emit('message', payload);

  // Save to backend API
  await fetch('http://localhost:5000/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
} catch (err) {
  console.error('❌ Failed to send message:', err);
}


};

const sendTyping = () => {
if (!socket || !user) return;
socket.emit('typing', {
room: 'global',
userId: user.id,
username: user.username,
});
};

return (
<div className="chat container mt-3">
<h4 className="mb-3">💬 Global Chat</h4>

  {loading ? (
    <div className="text-center text-muted">Loading messages...</div>
  ) : (
    <MessageList messages={messages} />
  )}

  <div className="text-muted small">
    {typingUsers.length > 0 && `${typingUsers.join(', ')} typing...`}
  </div>

  <MessageInput onSend={sendMessage} onTyping={sendTyping} />
</div>


);
}