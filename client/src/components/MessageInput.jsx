import React, { useState } from 'react';

export default function MessageInput({ onSend, onTyping }) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!value.trim()) return;

    setSending(true);
    try {
      // Handle both async and sync send functions
      if (typeof onSend === 'function') {
        await Promise.resolve(onSend(value.trim()));
      } else {
        console.error('onSend is not a function');
      }
      setValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (typeof onTyping === 'function') {
      onTyping();
    }
  };

  return (
    <div className="d-flex gap-2 p-2 border-top bg-light">
      <input
        type="text"
        className="form-control"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        placeholder={sending ? 'Sending...' : 'Type a message...'}
        disabled={sending}
      />
      <button
        className="btn btn-primary"
        onClick={handleSend}
        disabled={sending || !value.trim()}
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
