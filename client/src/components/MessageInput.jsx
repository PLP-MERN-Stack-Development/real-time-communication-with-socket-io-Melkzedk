import React, { useState } from 'react';
export default function MessageInput({ onSend, onTyping }) {
const [value, setValue] = useState('');
const handleSend = () => {
if (!value.trim()) return;
onSend(value.trim());
setValue('');
};
return (
<div className="message-input">
<input
value={value}
onChange={(e) => { setValue(e.target.value); onTyping(); }}
onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
placeholder="Type a message..."
/>
<button onClick={handleSend}>Send</button>
</div>
);
}
