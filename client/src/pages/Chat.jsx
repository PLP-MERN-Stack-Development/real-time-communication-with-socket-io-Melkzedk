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
console.log('connected to socket', s.id);
s.emit('join', { userId: user.id, username: user.username, room:
'global' });
});
s.on('message', (m) => setMessages((prev) => [...prev, m]));
s.on('typing', ({ userId, username }) => {
setTypingUsers((t) => [...new Set([...t, username])]);
// remove after a delay
setTimeout(() => setTypingUsers((t) => t.filter((u) => u !== username)),
2000);
});
s.on('presence', (users) => console.log('presence', users));
return () => {
s.disconnect();
};
}, [user]);
const sendMessage = (text) => {
if (!socket) return;
const payload = { room: 'global', fromId: user.id, text };
socket.emit('message', payload);
};
const sendTyping = () => {
if (!socket) return;
socket.emit('typing', { room: 'global', userId: user.id, username:
user.username });
};
return (
<div className="chat">
<aside>
<h3>Users</h3>
{/* implement Sidebar component showing online users */}
</aside>
<main>
<MessageList messages={messages} />
<div>{typingUsers.length > 0 && <div>{typingUsers.join(', ')}
typing...</div>}</div>
<MessageInput onSend={sendMessage} onTyping={sendTyping} />
</main>
</div>
);
}