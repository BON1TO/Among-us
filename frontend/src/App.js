import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import CheckUser from './Checkuser'; // ✅ Make sure this is correct casing

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CheckUser />} /> {/* ✅ Default landing page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect any unknown route to / */}
      </Routes>
    </Router>
  );
}
