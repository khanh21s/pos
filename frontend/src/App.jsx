import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Pos from './pages/Pos';
import ProductManagement from './pages/ProductManagement';
import PurchaseOrder from './pages/PurchaseOrder';
import SupplierManagement from './pages/SupplierManagement';
import OrderHistory from './pages/OrderHistory';

import CustomerManagement from './pages/CustomerManagement';
import PromotionManagement from './pages/PromotionManagement';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return Boolean(token);
};

const getRedirectAfterLogin = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return '/dashboard';

  try {
    const user = JSON.parse(userData);
    return user.role === 'ADMIN' ? '/dashboard' : '/pos';
  } catch (error) {
    return '/dashboard';
  }
};

const RequireAuth = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to={getRedirectAfterLogin()} replace /> : <Login />}
        />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/products" element={<RequireAuth><ProductManagement /></RequireAuth>} />
        <Route path="/purchase-orders" element={<RequireAuth><PurchaseOrder /></RequireAuth>} />
        <Route path="/suppliers" element={<RequireAuth><SupplierManagement /></RequireAuth>} />
        <Route path="/customers" element={<RequireAuth><CustomerManagement /></RequireAuth>} />
        <Route path="/promotions" element={<RequireAuth><PromotionManagement /></RequireAuth>} />
        <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
        <Route path="/audit-logs" element={<RequireAuth><AuditLogs /></RequireAuth>} />
        <Route path="/pos" element={<RequireAuth><Pos /></RequireAuth>} />
        <Route path="/orders/history" element={<RequireAuth><OrderHistory /></RequireAuth>} />
        {/* Default route */}
        <Route path="/" element={<Navigate to={isAuthenticated() ? getRedirectAfterLogin() : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
