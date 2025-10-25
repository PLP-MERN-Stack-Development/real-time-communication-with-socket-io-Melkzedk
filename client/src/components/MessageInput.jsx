import React, { useState } from 'react';

export default function MessageInput({ onSend, onTyping }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="d-flex gap-2 p-2 border-top bg-light">
      <input
        type="text"
        className="form-control"
        value={value}
        onChange={(e) => { setValue(e.target.value); onTyping(); }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        placeholder="Type a message..."
      />
      <button className="btn btn-primary" onClick={handleSend}>Send</button>
    </div>
  );
}
