// client/src/pages/Chat.jsx
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

  useEffect(() => {
    if (!user) return;

    const s = createSocket({ userId: user.id, username: user.username });
    setSocket(s);

    s.on('connect', () => {
      console.log('✅ Connected to socket:', s.id);
      s.emit('join', { userId: user.id, username: user.username, room: 'global' });
    });

    s.on('newMessage', (m) => setMessages((prev) => [...prev, m]));

    s.on('typing', ({ userId, username }) => {
      setTypingUsers((t) => [...new Set([...t, username])]);
      setTimeout(() => setTypingUsers((t) => t.filter((u) => u !== username)), 2000);
    });

    s.on('presence', (users) => console.log('presence', users));

    return () => {
      s.disconnect();
    };
  }, [user]);

  const sendMessage = (text) => {
    if (!socket) return;
    const payload = { room: 'global', userId: user.id, text }; // ✅ FIXED KEY
    socket.emit('message', payload);
  };

  const sendTyping = () => {
    if (!socket) return;
    socket.emit('typing', { room: 'global', userId: user.id, username: user.username });
  };

  return (
    <div className="chat container mt-3">
      <h4 className="mb-3">Global Chat</h4>

      <MessageList messages={messages} />

      <div className="text-muted small">
        {typingUsers.length > 0 && `${typingUsers.join(', ')} typing...`}
      </div>

      <MessageInput onSend={sendMessage} onTyping={sendTyping} />
    </div>
  );
}
