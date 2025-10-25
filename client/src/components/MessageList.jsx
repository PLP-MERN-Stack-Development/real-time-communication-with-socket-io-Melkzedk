import React from 'react';

export default function MessageList({ messages }) {
  return (
    <div className="message-list p-3 bg-light border rounded overflow-auto" style={{ height: '400px' }}>
      {messages.length === 0 ? (
        <div className="text-muted text-center mt-5">No messages yet</div>
      ) : (
        messages.map((m) => (
          <div key={m.id} className="message-item mb-3 p-2 border rounded bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong className="text-primary">{m.fromId}</strong>
              <small className="text-muted">{new Date(m.createdAt).toLocaleTimeString()}</small>
            </div>
            <div>{m.text}</div>
          </div>
        ))
      )}
    </div>
  );
}
