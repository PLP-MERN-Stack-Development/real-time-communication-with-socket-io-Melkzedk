// client/src/components/MessageList.js
import React from 'react';

export default function MessageList({ messages, user }) {
  return (
    <div className="p-3 bg-light" style={{ height: '400px', overflowY: 'auto' }}>
      {messages.length === 0 ? (
        <div className="text-muted text-center mt-5">No messages yet</div>
      ) : (
        messages.map((m, index) => {
          const isOwn = m.from?._id === user?._id;
          return (
            <div
              key={m._id || index}
              className={`mb-2 p-2 rounded ${isOwn ? 'bg-primary text-white ms-auto' : 'bg-white text-dark me-auto'}`}
              style={{
                maxWidth: '75%',
                wordBreak: 'break-word',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              <strong>{m.from?.username || 'Unknown'}:</strong>
              <div>{m.text}</div>
              <small className="text-muted d-block text-end" style={{ fontSize: '0.75rem' }}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </small>
            </div>
          );
        })
      )}
    </div>
  );
}
