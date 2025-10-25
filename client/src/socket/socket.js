import { io } from 'socket.io-client';

// createSocket receives token or query params (userId/username) for demo
export function createSocket({ userId, username }) {
  const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    query: { userId, username },
  });

  return socket;
}
