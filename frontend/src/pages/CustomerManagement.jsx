import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, User, Phone, Edit, Award, MapPin, Mail, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react';
import './CustomerManagement.css';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', email: '', address: '' });

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8081/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy khách hàng", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setEditFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8081/api/customers/${selectedCustomer.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cập nhật thông tin khách hàng thành công!');
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật khách hàng.'));
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  const getTierBadgeClass = (tier) => {
    if (!tier) return 'tier-dong';
    const t = tier.toUpperCase();
    if (t === 'KIM CƯƠNG') return 'tier-kim-cuong';
    if (t === 'VÀNG') return 'tier-vang';
    if (t === 'BẠC') return 'tier-bac';
    return 'tier-dong';
  };

  return (
    <div className="crm-management-container">
      <div className="crm-management-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <h1>Quản lý Khách hàng (CRM)</h1>
        </div>
        <div className="crm-search-bar-management">
          <Search size={20} color="#64748b" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="crm-table-container">
        {loading ? (
          <div className="loading-state">Đang tải danh sách khách hàng...</div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Điểm tích lũy</th>
                <th>Hạng thành viên</th>
                <th>Tổng chi tiêu</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-slate-500">Không tìm thấy khách hàng nào.</td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div className="td-user-info">
                        <div className="avatar-placeholder">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{customer.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="td-contact-info">
                        <div className="contact-item" title="Số điện thoại">
                          <Phone size={14} /> {customer.phone || 'Chưa cập nhật'}
                        </div>
                        {customer.email && (
                          <div className="contact-item" title="Email">
                            <Mail size={14} /> {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="td-points">
                        <Award size={18} color="#eab308" />
                        <span className="font-bold text-slate-700">{customer.points || 0}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tier-badge ${getTierBadgeClass(customer.membershipTier)}`}>
                        {customer.membershipTier || 'ĐỒNG'}
                      </span>
                    </td>
                    <td>
                      <div className="td-spent">
                        <CreditCard size={16} color="#64748b" />
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpent || 0)}</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn-edit-customer" onClick={() => handleEditClick(customer)} title="Chỉnh sửa thông tin">
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isEditModalOpen && (
        <div className="crm-modal-overlay">
          <div className="crm-modal-content">
            <div className="crm-modal-header">
              <h2>Chỉnh sửa Thông tin Khách hàng</h2>
              <button className="btn-close-modal" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="crm-modal-body">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Tên khách hàng <span className="text-red">*</span></label>
                  <input 
                    type="text" 
                    value={editFormData.name} 
                    onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại <span className="text-red">*</span></label>
                  <input 
                    type="text" 
                    value={editFormData.phone} 
                    onChange={e => setEditFormData({...editFormData, phone: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={editFormData.email} 
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input 
                  type="text" 
                  value={editFormData.address} 
                  onChange={e => setEditFormData({...editFormData, address: e.target.value})} 
                />
              </div>
              
              <div className="crm-security-notice">
                <div className="notice-icon">ℹ️</div>
                <div className="notice-text">
                  Theo chính sách hệ thống, không được phép chỉnh sửa <b>Điểm tích lũy</b> và <b>Hạng thành viên</b> tại đây. Các thông tin này được cập nhật tự động qua các giao dịch mua hàng.
                </div>
              </div>

              <div className="crm-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
