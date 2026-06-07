import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Edit, Trash2, ArrowLeft, UserCircle } from 'lucide-react';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    role: 'STAFF', 
    isActive: true 
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8081/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân viên", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', password: '', role: 'STAFF', isActive: true });
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
        name: user.name || '',
        username: user.username || '',
        password: '', // Để trống, nếu nhập mới là đổi MK
        role: user.role || 'STAFF',
        isActive: user.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      
      if (editingUser) {
        if (!payload.password) {
            delete payload.password; // Không update MK nếu để trống
        }
        await axios.put(`http://localhost:8081/api/users/${editingUser.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Cập nhật nhân viên thành công!');
      } else {
        if (!payload.password) {
            alert("Mật khẩu không được để trống khi tạo mới!");
            return;
        }
        await axios.post(`http://localhost:8081/api/users`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Thêm nhân viên thành công!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu nhân viên.'));
    }
  };

  const handleDisableClick = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn khóa tài khoản "${user.username}" không? Tài khoản này sẽ không thể đăng nhập được nữa.`)) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8081/api/users/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Khóa tài khoản thành công!');
            fetchUsers();
        } catch (error) {
            alert('Lỗi khi khóa tài khoản.');
        }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="users-management-container">
      <div className="users-management-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <h1>Quản trị Nhân viên</h1>
        </div>
        <div className="header-actions">
            <div className="users-search-bar">
            <Search size={20} color="#64748b" />
            <input 
                type="text" 
                placeholder="Tìm theo tên, username..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            </div>
            <button className="btn-add-user" onClick={handleAddClick}>
                <UserPlus size={18} /> Thêm nhân viên
            </button>
        </div>
      </div>

      <div className="users-table-container">
        {loading ? (
          <div className="loading-state" style={{padding: '24px', textAlign: 'center'}}>Đang tải danh sách nhân viên...</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Username</th>
                <th>Phân quyền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-slate-500">Không tìm thấy nhân viên nào.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="td-user-info">
                        <div className="avatar-placeholder">
                          {user.name ? user.name.charAt(0).toUpperCase() : <UserCircle />}
                        </div>
                        <span className="font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="font-medium">{user.username}</td>
                    <td>
                        <span style={{
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            backgroundColor: user.role === 'ADMIN' ? '#fef08a' : '#e2e8f0',
                            color: user.role === 'ADMIN' ? '#854d0e' : '#475569'
                        }}>
                            {user.role}
                        </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                        {user.isActive !== false ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit-user" onClick={() => handleEditClick(user)} title="Sửa thông tin">
                            <Edit size={16} />
                        </button>
                        <button className="btn-delete-user" onClick={() => handleDisableClick(user)} title="Khóa tài khoản" disabled={user.isActive === false}>
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
        <div className="users-modal-overlay">
          <div className="users-modal-content">
            <div className="users-modal-header">
              <h2>{editingUser ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên Mới'}</h2>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="users-modal-body">
              <div className="form-group">
                <label>Tên hiển thị <span className="text-red">*</span></label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Tên đăng nhập (Username) <span className="text-red">*</span></label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  required 
                  disabled={editingUser !== null} // Không cho đổi username khi sửa
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu {editingUser ? '' : <span className="text-red">*</span>}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder={editingUser ? "Để trống nếu không muốn đổi" : "Nhập mật khẩu..."}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Phân quyền <span className="text-red">*</span></label>
                <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                >
                    <option value="STAFF">Thu ngân (STAFF)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
              {editingUser && (
                <div className="form-group">
                    <label>Trạng thái hoạt động</label>
                    <select 
                        value={formData.isActive} 
                        onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}
                    >
                        <option value={true}>Đang hoạt động</option>
                        <option value={false}>Đã khóa</option>
                    </select>
                </div>
              )}

              <div className="users-modal-footer" style={{marginTop: '16px'}}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
