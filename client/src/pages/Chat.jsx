import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { createSocket } from "../socket/socket";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

export default function Chat() {
  const { user, loadingUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (loadingUser) return; // wait until user is loaded

    if (!user || !user._id) {
      console.warn("⚠️ No user found in AuthContext — redirect to login maybe?");
      setLoadingMessages(false);
      return;
    }

    console.log("🔍 Initializing chat for user:", user);

    const newSocket = createSocket(user._id);
    if (!newSocket) return;
    setSocket(newSocket);

    // Fetch messages from backend
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages`);
        if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
        const data = await res.json();

        // Normalize _id and from fields
        const normalized = data.map(msg => ({
          ...msg,
          _id: msg._id?.$oid || msg._id,
          from: typeof msg.from === 'object' && msg.from.$oid ? msg.from.$oid : msg.from
        }));

        console.log("✅ Messages fetched successfully:", normalized);
        setMessages(normalized);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Listen for new socket messages
    newSocket.on("receiveMessage", (message) => {
      const normalized = {
        ...message,
        _id: message._id?.$oid || message._id,
        from: typeof message.from === 'object' && message.from.$oid ? message.from.$oid : message.from
      };
      console.log("📩 Received new message via socket:", normalized);
      setMessages(prev => [...prev, normalized]);
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting socket...");
      newSocket.disconnect();
    };
  }, [user, loadingUser, API_URL]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const newMessage = {
      from: { _id: user._id, username: user.username || "Unknown" },
      text,
      createdAt: new Date(),
      room: "global",
    };

    console.log("✉️ Sending message:", newMessage);
    socket?.emit("sendMessage", newMessage);

    try {
      await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: user._id, // string
          text,
          room: "global",
        }),
      });
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }

    setMessages(prev => [...prev, newMessage]);
  };

  if (loadingUser || loadingMessages) {
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Loading chat...
      </p>
    );
  }

  if (!user || !user._id) {
    return (
      <p style={{ textAlign: "center" }}>
        ⚠️ Please log in to access chat.
      </p>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">💬 Real-Time Chat</h3>
      <div className="card shadow-sm">
        <div
          className="card-body p-0"
          style={{ height: "400px", overflowY: "auto" }}
        >
          <MessageList messages={messages} user={user} />
          <div ref={messagesEndRef}></div>
        </div>
        <div className="card-footer">
          <MessageInput onSend={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
