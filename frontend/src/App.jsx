import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Placeholder components
const Dashboard = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
    <h1>Admin Dashboard</h1>
    <p>Welcome to the management area.</p>
  </div>
);

import Pos from './pages/Pos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<Pos />} />
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
