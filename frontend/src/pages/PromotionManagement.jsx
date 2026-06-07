import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Tag, Calendar, Plus, Edit, Trash2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import './PromotionManagement.css';

const PromotionManagement = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent',
    discountValue: '',
    minOrderValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    categoryId: ''
  });

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8081/api/promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy danh sách khuyến mãi", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/categories/public');
      setCategories(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách danh mục", error);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percent',
      discountValue: '',
      minOrderValue: 0,
      minOrderValue: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      categoryId: ''
    });
    setEditingId(null);
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingId(promo.id);
      setFormData({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minOrderValue: promo.minOrderValue,
        minOrderValue: promo.minOrderValue,
        startDate: promo.startDate ? promo.startDate.substring(0, 16) : '',
        endDate: promo.endDate ? promo.endDate.substring(0, 16) : '',
        isActive: promo.active,
        categoryId: promo.category ? promo.category.id : ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
          ...formData,
          active: formData.isActive,
          category: formData.categoryId ? { id: formData.categoryId } : null
      };
      
      if (editingId) {
        await axios.put(`http://localhost:8081/api/promotions/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Cập nhật Voucher thành công!');
      } else {
        await axios.post('http://localhost:8081/api/promotions', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Tạo mới Voucher thành công!');
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu Voucher.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa Voucher này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã xóa Voucher.');
      fetchPromotions();
    } catch (error) {
      alert('Lỗi khi xóa Voucher.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (promo) => {
      if (!promo.active) return <span className="promo-badge badge-inactive">Vô hiệu hóa</span>;
      
      const now = new Date();
      const start = promo.startDate ? new Date(promo.startDate) : null;
      const end = promo.endDate ? new Date(promo.endDate) : null;

      if (start && now < start) return <span className="promo-badge badge-upcoming">Sắp diễn ra</span>;
      if (end && now > end) return <span className="promo-badge badge-expired">Đã hết hạn</span>;
      
      return <span className="promo-badge badge-active">Đang diễn ra</span>;
  };

  return (
    <div className="promo-management-container">
      <div className="promo-management-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <h1>Chương trình Khuyến mãi (Vouchers)</h1>
        </div>
        <button className="btn-add-promo" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Thêm Voucher mới
        </button>
      </div>

      <div className="promo-table-container">
        {loading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : (
          <table className="promo-table">
            <thead>
              <tr>
                <th>Mã Voucher</th>
                <th>Mức Giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Thời gian áp dụng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-slate-500">Chưa có chương trình khuyến mãi nào.</td>
                </tr>
              ) : (
                promotions.map(promo => (
                  <tr key={promo.id}>
                    <td>
                      <div className="td-promo-code">
                        <Tag size={16} color="#3b82f6" />
                        <span className="font-bold text-slate-800">{promo.code}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium text-green-600">
                          {promo.discountType === 'percent' ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                      </span>
                    </td>
                    <td>{formatPrice(promo.minOrderValue)}</td>
                    <td>
                      <div className="td-promo-time">
                        <Calendar size={14} color="#64748b" />
                        <span>
                            {promo.startDate ? new Date(promo.startDate).toLocaleString('vi-VN') : 'Không giới hạn'}
                            {' - '}
                            {promo.endDate ? new Date(promo.endDate).toLocaleString('vi-VN') : 'Không giới hạn'}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(promo)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-icon text-blue" onClick={() => handleOpenModal(promo)} title="Sửa">
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon text-red" onClick={() => handleDelete(promo.id)} title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="promo-modal-overlay">
          <div className="promo-modal-content">
            <div className="promo-modal-header">
              <h2>{editingId ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}</h2>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="promo-modal-body">
              <div className="form-group">
                <label>Mã Voucher (Code) <span className="text-red">*</span></label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="VD: SUMMER2024"
                  required 
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Loại Giảm Giá</label>
                  <select 
                    value={formData.discountType} 
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="percent">Giảm theo phần trăm (%)</option>
                    <option value="amount">Giảm theo số tiền (VNĐ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mức Giảm <span className="text-red">*</span></label>
                  <div className="input-with-suffix">
                      <input 
                        type="number" 
                        value={formData.discountValue} 
                        onChange={e => setFormData({...formData, discountValue: e.target.value})} 
                        required 
                        min="1"
                        step={formData.discountType === 'percent' ? '1' : '1000'}
                      />
                      <span className="suffix">{formData.discountType === 'percent' ? '%' : 'đ'}</span>
                  </div>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Áp dụng cho Danh mục</label>
                  <select 
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Tất cả sản phẩm</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Áp dụng cho Đơn hàng từ (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.minOrderValue} 
                    onChange={e => setFormData({...formData, minOrderValue: e.target.value})} 
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Thời gian Bắt đầu</label>
                  <input 
                    type="datetime-local" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian Kết thúc</label>
                  <input 
                    type="datetime-local" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group switch-group">
                <label className="switch-label">
                  <span className="switch-text">Trạng thái (Kích hoạt)</span>
                  <div className={`switch-toggle ${formData.isActive ? 'active' : ''}`} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                    <div className="switch-knob"></div>
                  </div>
                </label>
              </div>

              <div className="promo-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary">Lưu Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
