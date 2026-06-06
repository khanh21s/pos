import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit2, Trash2, X, Save, MapPin, Phone, FileText } from 'lucide-react';
import './SupplierManagement.css';

const SupplierManagement = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8081/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setForm({
        name: supplier.name || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        note: supplier.note || ''
      });
    } else {
      setEditingSupplier(null);
      setForm({ name: '', phone: '', address: '', note: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingSupplier) {
        await axios.put(`http://localhost:8081/api/suppliers/${editingSupplier.id}`, form, { headers });
      } else {
        await axios.post('http://localhost:8081/api/suppliers', form, { headers });
      }
      
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đối tác này? (Hệ thống sẽ lưu trữ lịch sử nhập kho của đối tác này)")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSuppliers();
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa!');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.phone && s.phone.includes(searchQuery))
  );

  return (
    <div className="sm-container">
      <div className="sm-header">
        <div className="sm-header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Quản lý Nhà cung cấp</h1>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} style={{marginRight: '8px'}}/> Thêm Đối Tác
        </button>
      </div>

      <div className="sm-filters glass">
        <div className="search-bar">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sm-table-container glass">
        {loading ? (
          <div className="sm-loading">Đang tải dữ liệu...</div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th>Tên Nhà cung cấp</th>
                <th width="150">Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Ghi chú</th>
                <th width="100" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="sm-name">{s.name}</div>
                  </td>
                  <td>
                    {s.phone ? (
                      <div className="sm-contact"><Phone size={14}/> {s.phone}</div>
                    ) : <span className="text-gray-400">---</span>}
                  </td>
                  <td>
                    {s.address ? (
                      <div className="sm-contact"><MapPin size={14}/> {s.address}</div>
                    ) : <span className="text-gray-400">---</span>}
                  </td>
                  <td>
                    {s.note ? (
                      <div className="sm-contact"><FileText size={14}/> {s.note}</div>
                    ) : <span className="text-gray-400">---</span>}
                  </td>
                  <td className="text-center">
                    <div className="sm-actions">
                      <button className="btn-icon text-blue" onClick={() => handleOpenModal(s)} title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon text-red" onClick={() => handleDelete(s.id)} title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="sm-empty">Không tìm thấy nhà cung cấp nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content drawer slide-left">
            <div className="modal-header">
              <h2>{editingSupplier ? 'Sửa Đối Tác' : 'Thêm Mới Đối Tác'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave} className="sm-form">
                <div className="form-group">
                  <label>Tên đối tác <span className="req">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="VD: Đại lý Bia Q1..." 
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input 
                    type="text" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    placeholder="VD: 0901234567" 
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input 
                    type="text" 
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                    placeholder="Số nhà, đường, quận..." 
                  />
                </div>
                <div className="form-group">
                  <label>Ghi chú / Đánh giá</label>
                  <textarea 
                    value={form.note} 
                    onChange={e => setForm({...form, note: e.target.value})} 
                    placeholder="Chính sách công nợ, giao hàng..." 
                    rows="4"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary w-full" style={{display:'flex', justifyContent:'center'}}>
                    <Save size={18} style={{marginRight: '8px'}}/> 
                    {editingSupplier ? 'Cập nhật' : 'Lưu Đối Tác'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
