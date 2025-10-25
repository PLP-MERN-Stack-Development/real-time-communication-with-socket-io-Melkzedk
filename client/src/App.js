import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Chat from './pages/Chat';
function App() {
// For quick start, set user via localStorage or a simple login form
return (
<AuthProvider>
<Chat />
</AuthProvider>
);
}
export default App;