import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Clock, User, Database, FileJson } from 'lucide-react';
import './AuditLogs.css';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8081/api/audit-logs';
      if (selectedUser) {
        url += `?userId=${selectedUser}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy nhật ký hệ thống", error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8081/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data || []);
    } catch (error) {
        console.error("Lỗi lấy danh sách nhân viên", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLogs();
  }, [selectedUser]);

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : (userId ? `ID: ${userId}` : 'Hệ thống');
  };

  const getActionClass = (action) => {
    if (!action) return 'action-badge';
    const a = action.toUpperCase();
    if (a.includes('CREATE') || a.includes('ADD')) return 'action-badge action-create';
    if (a.includes('UPDATE') || a.includes('EDIT')) return 'action-badge action-update';
    if (a.includes('DELETE') || a.includes('REMOVE') || a.includes('REFUND') || a.includes('CANCEL')) return 'action-badge action-delete';
    return 'action-badge';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
  };

  const filteredLogs = logs.filter(log => 
    (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.tableName && log.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.recordId && log.recordId.toString().includes(searchQuery))
  );

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'json'

  const formatJson = (jsonString) => {
      if (!jsonString) return "Trống (Null)";
      try {
          const obj = JSON.parse(jsonString);
          return JSON.stringify(obj, null, 2);
      } catch (e) {
          return jsonString; // Fallback if not valid JSON
      }
  };

  const keyMap = {
      name: "Tên",
      sellPrice: "Giá bán",
      importPrice: "Giá nhập",
      stock: "Tồn kho",
      minStock: "Tồn kho tối thiểu",
      category: "Danh mục",
      image: "Hình ảnh",
      description: "Mô tả",
      isActive: "Trạng thái hoạt động",
      barcode: "Mã vạch (Barcode)",
      sku: "Mã lưu kho (SKU)",
      importUnit: "Đơn vị nhập",
      sellUnit: "Đơn vị bán",
      conversionRate: "Tỷ lệ quy đổi",
      totalPrice: "Tổng tiền",
      discountAmount: "Tiền giảm giá",
      promotionDiscount: "Giảm giá Khuyến mãi",
      status: "Trạng thái",
      code: "Mã khuyến mãi",
      discountPercent: "Phần trăm giảm (%)",
      maxDiscountAmount: "Mức giảm tối đa",
      minOrderAmount: "Giá trị đơn tối thiểu",
      startDate: "Ngày bắt đầu",
      endDate: "Ngày kết thúc"
  };

  const ignoredKeys = ['id', 'createdAt', 'updatedAt', 'deletedAt'];

  const formatValue = (key, val) => {
      if (val === null || val === undefined || val === "") return "(Trống)";
      if (typeof val === 'boolean') return val ? "Bật / Có" : "Tắt / Không";
      if (typeof val === 'object') {
          if (Array.isArray(val)) {
              // Check if it's a date array [2026, 6, 5, ...]
              if (val.length >= 3 && typeof val[0] === 'number') {
                  return `${val[2]}/${val[1]}/${val[0]} ${val[3]||'00'}:${val[4]||'00'}`;
              }
              return `[Danh sách ${val.length} mục]`;
          }
          if (val.name) return val.name;
          if (val.id) return `ID: ${val.id}`;
          return "(Đối tượng phức tạp)";
      }
      if (typeof val === 'number') {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('price') || lowerKey.includes('amount') || lowerKey.includes('cost')) {
              return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
          }
          return val.toString();
      }
      return val.toString();
  };

  const getChangesList = (oldJson, newJson) => {
      let oldObj = {};
      let newObj = {};
      try { if (oldJson) oldObj = JSON.parse(oldJson) || {}; } catch(e){}
      try { if (newJson) newObj = JSON.parse(newJson) || {}; } catch(e){}

      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
      const changes = [];

      allKeys.forEach(key => {
          if (ignoredKeys.includes(key)) return;

          let oldVal = oldObj[key];
          let newVal = newObj[key];
          
          // Tránh lỗi so sánh Category object đầy đủ vs Category object rỗng
          if (typeof oldVal === 'object' && oldVal !== null && oldVal.id) oldVal = oldVal.id;
          if (typeof newVal === 'object' && newVal !== null && newVal.id) newVal = newVal.id;

          if (oldVal !== newVal && JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
              changes.push({
                  key: keyMap[key] || key,
                  oldVal: formatValue(key, oldObj[key]),
                  newVal: formatValue(key, newObj[key])
              });
          }
      });
      return changes;
  };

  return (
    <div className="auditlogs-container">
      <div className="auditlogs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <h1>Nhật ký Bảo mật (Audit Logs)</h1>
        </div>
        <div className="audit-filters">
            <select 
                className="audit-select-user"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
            >
                <option value="">Tất cả nhân viên</option>
                {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
                ))}
            </select>
            <div className="audit-search-bar">
                <Search size={20} color="#64748b" />
                <input 
                    type="text" 
                    placeholder="Tìm Action, Table, Record ID..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="auditlogs-table-container">
        {loading ? (
          <div className="loading-state" style={{padding: '24px', textAlign: 'center'}}>Đang tải nhật ký...</div>
        ) : (
          <table className="auditlogs-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Nhân viên</th>
                <th>Hành động</th>
                <th>Bảng dữ liệu</th>
                <th>Record ID</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-slate-500">Không có nhật ký nào.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#475569'}}>
                        <Clock size={14} /> {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500'}}>
                        <User size={14} /> {getUserName(log.userId)}
                      </div>
                    </td>
                    <td>
                        <span className={getActionClass(log.action)}>
                            {log.action}
                        </span>
                    </td>
                    <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <Database size={14} color="#64748b"/> {log.tableName}
                        </div>
                    </td>
                    <td style={{fontWeight: '600', color: '#334155'}}>
                        {log.recordId || '-'}
                    </td>
                    <td>
                        <button className="btn-view-diff" onClick={() => setSelectedLog(log)}>
                            Xem Chi tiết
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedLog && (
        <div className="diff-modal-overlay">
          <div className="diff-modal-content">
            <div className="diff-modal-header">
              <h2>
                  <FileJson size={20} color="#3b82f6" />
                  Chi tiết thay đổi dữ liệu
              </h2>
              <button className="btn-close-modal" onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            
            <div style={{padding: '16px 24px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '24px', fontSize: '14px', color: '#1e293b'}}>
                <div><b>Hành động:</b> <span className={getActionClass(selectedLog.action)}>{selectedLog.action}</span></div>
                <div><b>Bảng:</b> {selectedLog.tableName}</div>
                <div><b>Record ID:</b> {selectedLog.recordId || 'N/A'}</div>
                <div><b>Nhân viên:</b> {getUserName(selectedLog.userId)}</div>
            </div>

            <div className="view-toggle">
              <button 
                className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                Danh sách Thay đổi
              </button>
              <button 
                className={`btn-toggle ${viewMode === 'json' ? 'active' : ''}`}
                onClick={() => setViewMode('json')}
              >
                JSON gốc
              </button>
            </div>

            <div className="diff-modal-body" style={{display: viewMode === 'list' ? 'block' : 'grid'}}>
              {viewMode === 'list' ? (
                <div style={{border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden'}}>
                  <table className="changes-table">
                    <thead>
                      <tr>
                        <th style={{width: '30%'}}>Trường dữ liệu</th>
                        <th style={{width: '35%'}}>Giá trị CŨ</th>
                        <th style={{width: '35%'}}>Giá trị MỚI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getChangesList(selectedLog.oldValues, selectedLog.newValues).length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{textAlign: 'center', color: '#64748b'}}>Không có thay đổi nào.</td>
                        </tr>
                      ) : (
                        getChangesList(selectedLog.oldValues, selectedLog.newValues).map((c, i) => (
                          <tr key={i}>
                            <td style={{fontWeight: '600'}}>{c.key}</td>
                            <td className="old-val">{c.oldVal}</td>
                            <td className="new-val">{c.newVal}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <div className="diff-panel">
                    <div className="diff-panel-title old">
                        Dữ liệu CŨ (Old Values)
                    </div>
                    <pre className="diff-content">
                        {formatJson(selectedLog.oldValues)}
                    </pre>
                  </div>
                  <div className="diff-panel">
                    <div className="diff-panel-title new">
                        Dữ liệu MỚI (New Values)
                    </div>
                    <pre className="diff-content">
                        {formatJson(selectedLog.newValues)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
