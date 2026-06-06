import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState('today');
  const [data, setData] = useState({
    kpi: { totalOrders: 0, totalRevenue: 0, grossProfit: 0 },
    topProducts: [],
    lowStockAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData(range);
  }, [range]);

  const fetchDashboardData = async (selectedRange) => {
    setLoading(true);
    setError(null);
    try {
      // Mocking Authorization header since this requires ADMIN role
      // In a real app, you'd get this from context or localStorage
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8081/api/dashboard?range=${selectedRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Báo Cáo Tổng Quan</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/products')} className="nav-button">Quản lý Sản phẩm</button>
          <button onClick={() => navigate('/suppliers')} className="nav-button">Quản lý Đối tác</button>
          <button onClick={() => navigate('/purchase-orders')} className="nav-button" style={{backgroundColor: '#e67e22', color: 'white'}}>Lập phiếu Nhập kho</button>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="range-selector">
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
          <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="kpi-grid">
            <div className="kpi-card glass">
              <h3>Số đơn hàng</h3>
              <p className="kpi-value">{data.kpi.totalOrders}</p>
            </div>
            <div className="kpi-card glass">
              <h3>Tổng doanh thu</h3>
              <p className="kpi-value revenue">{formatCurrency(data.kpi.totalRevenue)}</p>
            </div>
            <div className="kpi-card glass">
              <h3>Lợi nhuận gộp</h3>
              <p className="kpi-value profit">{formatCurrency(data.kpi.grossProfit)}</p>
            </div>
          </div>

          <div className="split-view">
            <div className="left-panel glass">
              <h2>Top 10 Sản phẩm bán chạy</h2>
              <table className="top-products-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Đã bán</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="product-thumb" />
                      </td>
                      <td>{product.name}</td>
                      <td className="sold-count">{product.totalSold}</td>
                    </tr>
                  ))}
                  {data.topProducts.length === 0 && (
                    <tr>
                      <td colSpan="3" className="empty-message">Không có dữ liệu bán hàng.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="right-panel glass">
              <h2>Cảnh báo sắp hết hàng</h2>
              <ul className="low-stock-list">
                {data.lowStockAlerts.map((product) => (
                  <li key={product.id} className={`low-stock-item ${product.stock <= 0 ? 'critical' : ''}`}>
                    <div className="item-info">
                      <span className="item-name">{product.name}</span>
                      {product.stock <= 0 && <span className="critical-icon">⚠️</span>}
                    </div>
                    <div className="item-stock">
                      <span className="current-stock">Tồn: {product.stock}</span>
                      <span className="min-stock">Min: {product.minStock}</span>
                    </div>
                  </li>
                ))}
                {data.lowStockAlerts.length === 0 && (
                  <li className="empty-message">Tuyệt vời! Kho hàng đang dồi dào.</li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
