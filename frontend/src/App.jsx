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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/purchase-orders" element={<PurchaseOrder />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/promotions" element={<PromotionManagement />} />
        <Route path="/users" element={<Users />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/orders/history" element={<OrderHistory />} />
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
