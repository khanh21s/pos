import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Pos from './pages/Pos';
import ProductManagement from './pages/ProductManagement';
import PurchaseOrder from './pages/PurchaseOrder';
import SupplierManagement from './pages/SupplierManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/purchase-orders" element={<PurchaseOrder />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/pos" element={<Pos />} />
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
