// client/src/socket/socket.js
import { io } from "socket.io-client";

// ✅ createSocket expects a userId
export const createSocket = (userId) => {
  if (!userId) {
    console.error("❌ createSocket called without userId!");
    return null;
  }

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  console.log("🔌 Connecting socket for user:", userId, "→", API_URL);

  const socket = io(API_URL, {
    query: { userId },
  });

  socket.on("connect", () =>
    console.log("✅ Socket connected:", socket.id)
  );
  socket.on("disconnect", () =>
    console.log("⚠️ Socket disconnected")
  );

  return socket;
};
