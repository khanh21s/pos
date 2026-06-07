import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Eye, AlertTriangle, RotateCcw, X, Calendar, User } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCashier, setSelectedCashier] = useState('ALL');

  // Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [orderRes, userRes] = await Promise.all([
        axios.get('http://localhost:8081/api/orders/history', { headers }),
        axios.get('http://localhost:8081/api/users', { headers }).catch(() => ({ data: [] }))
      ]);

      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
      // Filter out non-staff or keep all users for the dropdown
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử giao dịch:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    // Cashier filter
    const matchCashier = selectedCashier === 'ALL' || (order.user && order.user.id.toString() === selectedCashier);
    
    // Date filter
    let matchDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) matchDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (orderDate > end) matchDate = false;
      }
    }
    
    return matchCashier && matchDate;
  });

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;
    if (!window.confirm(`Bạn có CHẮC CHẮN muốn Hoàn Tiền cho hóa đơn #${selectedOrder.id}?\n\nThao tác này sẽ trả hàng về kho và thu hồi/hoàn lại điểm CRM của khách hàng. Không thể hoàn tác!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`http://localhost:8081/api/orders/${selectedOrder.id}/refund`, {}, { headers });
      
      alert('Đã hoàn tiền thành công!');
      setIsModalOpen(false);
      fetchData(); // Reload list to show REFUNDED status
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="order-history-container">
      <div className="oh-header">
        <div className="oh-header-left">
          <button className="btn-back" onClick={() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            navigate(user.role === 'ADMIN' ? '/dashboard' : '/pos');
          }}>
            <ArrowLeft size={20} />
          </button>
          <h1>Lịch sử Giao dịch & Đổi/Trả</h1>
        </div>
      </div>

      <div className="oh-filters glass">
        <div className="filter-group">
          <label><Calendar size={16}/> Từ ngày:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><Calendar size={16}/> Đến ngày:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><User size={16}/> Thu ngân:</label>
          <select value={selectedCashier} onChange={e => setSelectedCashier(e.target.value)}>
            <option value="ALL">Tất cả thu ngân</option>
            {users.map(u => (
              <option key={u.id} value={u.id.toString()}>{u.name || u.username}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="oh-table-container glass">
        {loading ? (
          <div className="oh-loading">Đang tải dữ liệu...</div>
        ) : (
          <table className="oh-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Thời gian</th>
                <th>Thu ngân</th>
                <th>Khách hàng</th>
                <th className="text-right">Tổng tiền</th>
                <th className="text-center">Thanh toán</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.map(o => (
                <tr key={o.id} className={o.status === 'REFUNDED' ? 'row-refunded' : ''}>
                  <td className="font-bold">#{o.id}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.user ? o.user.name || o.user.username : 'N/A'}</td>
                  <td>
                    {o.customer ? (
                      <div>
                        <div className="font-semibold text-blue">{o.customer.name}</div>
                        <div className="text-sm">{o.customer.phone}</div>
                      </div>
                    ) : 'Khách lẻ'}
                  </td>
                  <td className="text-right font-semibold text-orange">{formatCurrency(o.totalPrice - (o.discountAmount || 0) - (o.promotionDiscount || 0))}</td>
                  <td className="text-center">{o.paymentMethod || 'Tiền mặt'}</td>
                  <td className="text-center">
                    {o.status === 'COMPLETED' && <span className="badge-completed">Thành công</span>}
                    {o.status === 'REFUNDED' && <span className="badge-refunded">Đã hoàn tiền</span>}
                    {o.status === 'DRAFT' && <span className="badge-draft">Lưu nháp</span>}
                  </td>
                  <td className="text-center">
                    <button className="btn-icon text-blue" onClick={() => handleOpenModal(o)}>
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="oh-empty">Không tìm thấy hóa đơn nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg slide-up oh-modal">
            <div className="modal-header">
              <h2>Chi tiết Hóa đơn #{selectedOrder.id}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="oh-info-grid">
                <div className="oh-info-card">
                  <h4>Thông tin chung</h4>
                  <p><strong>Thời gian:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Thu ngân:</strong> {selectedOrder.user ? selectedOrder.user.name : 'N/A'}</p>
                  <p><strong>Phương thức:</strong> {selectedOrder.paymentMethod || 'Tiền mặt'}</p>
                  <p>
                    <strong>Trạng thái: </strong> 
                    {selectedOrder.status === 'COMPLETED' ? <span className="text-green font-bold">Thành công</span> : 
                     selectedOrder.status === 'REFUNDED' ? <span className="text-red font-bold">Đã hoàn tiền</span> : 
                     selectedOrder.status}
                  </p>
                </div>
                <div className="oh-info-card">
                  <h4>Khách hàng</h4>
                  {selectedOrder.customer ? (
                    <>
                      <p><strong>Tên:</strong> {selectedOrder.customer.name}</p>
                      <p><strong>SĐT:</strong> {selectedOrder.customer.phone}</p>
                      <p><strong>Hạng:</strong> {selectedOrder.customer.membershipTier}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">Khách lẻ (Không lưu thông tin)</p>
                  )}
                </div>
              </div>

              <h4 className="mt-4 mb-2">Danh sách mặt hàng</h4>
              <table className="oh-details-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">SL</th>
                    <th className="text-center">ĐVT</th>
                    <th className="text-right">Đơn giá</th>
                    <th className="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.orderDetails || []).map((detail, idx) => (
                    <tr key={idx}>
                      <td>{detail.product ? detail.product.name : 'Sản phẩm đã xóa'}</td>
                      <td className="text-center font-bold">{detail.quantity}</td>
                      <td className="text-center text-blue font-semibold">
                        {detail.isImportUnit 
                          ? (detail.product?.importUnit || 'Thùng') 
                          : (detail.product?.sellUnit || 'Lẻ')}
                      </td>
                      <td className="text-right">{formatCurrency(detail.sellPrice)}</td>
                      <td className="text-right font-semibold">{formatCurrency(detail.sellPrice * detail.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="oh-totals">
                <div className="oh-total-row">
                  <span>Tổng tiền hàng:</span>
                  <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                </div>
                {selectedOrder.promotion && (
                  <div className="oh-total-row text-green">
                    <span>Mã giảm giá ({selectedOrder.promotion.code}):</span>
                    <span>- {formatCurrency(selectedOrder.promotionDiscount)}</span>
                  </div>
                )}
                {selectedOrder.discountAmount > 0 && (
                  <div className="oh-total-row text-orange">
                    <span>Trừ điểm CRM ({selectedOrder.usedPoints} điểm):</span>
                    <span>- {formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="oh-total-row final-total">
                  <span>Khách đã thanh toán:</span>
                  <span>{formatCurrency(selectedOrder.totalPrice - (selectedOrder.discountAmount || 0) - (selectedOrder.promotionDiscount || 0))}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer oh-modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Đóng</button>
              {selectedOrder.status === 'COMPLETED' && (
                <button 
                  className="btn-danger btn-refund" 
                  onClick={handleRefund}
                  disabled={!selectedOrder.customer}
                  title={!selectedOrder.customer ? "Chỉ áp dụng đổi trả cho Khách hàng có tài khoản" : ""}
                  style={!selectedOrder.customer ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <RotateCcw size={18} style={{marginRight: '8px'}} />
                  Thực hiện Đổi/Trả (Refund)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
