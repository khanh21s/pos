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

const Pos = () => (
  <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
    <h1>POS Screen</h1>
    <p>High contrast, fast operation mode.</p>
  </div>
);

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
