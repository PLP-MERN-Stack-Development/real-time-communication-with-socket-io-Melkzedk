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

    // 🔄 Listen for new messages (same as backend event name)
    s.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // 📝 Typing event
    s.on('typing', ({ username }) => {
      setTypingUsers((t) => [...new Set([...t, username])]);
      // remove after delay
      setTimeout(() => setTypingUsers((t) => t.filter((u) => u !== username)), 2000);
    });

    // 👥 Presence info
    s.on('presence', (users) => console.log('presence:', users));

    return () => {
      s.disconnect();
    };
  }, [user]);

  // 📨 Send message
  const sendMessage = (text) => {
    if (!socket) return;
    const payload = { room: 'global', userId: user.id, text };
    socket.emit('message', payload);
  };

  // 💬 Send typing indicator
  const sendTyping = () => {
    if (!socket) return;
    socket.emit('typing', {
      room: 'global',
      userId: user.id,
      username: user.username,
    });
  };

  return (
    <div className="chat container py-3">
      <h4 className="text-center mb-3">Global Chat</h4>
      <main className="border rounded p-3 bg-white" style={{ height: '60vh', overflowY: 'auto' }}>
        <MessageList messages={messages} />
        {typingUsers.length > 0 && (
          <div className="text-muted small">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}
      </main>
      <MessageInput onSend={sendMessage} onTyping={sendTyping} />
    </div>
  );
}
