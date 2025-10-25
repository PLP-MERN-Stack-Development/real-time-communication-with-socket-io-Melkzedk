import React from 'react';
export default function MessageList({ messages }) {
return (
<div className="message-list">
{messages.map((m) => (
<div key={m.id} className="message-item">
<div><strong>{m.fromId}</strong> <small>{new
Date(m.createdAt).toLocaleTimeString()}</small></div>
<div>{m.text}</div>
</div>
))}
</div>
);
}
