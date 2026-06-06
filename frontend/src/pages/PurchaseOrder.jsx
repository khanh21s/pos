import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2, Save, User, Package } from 'lucide-react';
import './PurchaseOrder.css';

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8081/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  const handleSearchProduct = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8081/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const products = Array.isArray(res.data) ? res.data : [];
      const filtered = products.filter(p => 
        (p.active !== undefined ? p.active : p.isActive) && 
        (p.name.toLowerCase().includes(query.toLowerCase()) || 
         (p.barcode && p.barcode.includes(query)))
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      alert("Sản phẩm này đã có trong lưới nhập kho.");
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    
    setCart([...cart, {
      product: product,
      importQuantity: 1,
      isImportUnit: true,
      importPrice: (product.importPrice || 0) * (product.conversionRate || 1),
    }]);
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateCartItem = (productId, field, value) => {
    const numValue = Math.max(0, Number(value));
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        return { ...item, [field]: numValue };
      }
      return item;
    }));
  };

  const toggleUnit = (productId) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newIsImportUnit = !item.isImportUnit;
        const newPrice = newIsImportUnit 
            ? (item.product.importPrice || 0) * (item.product.conversionRate || 1)
            : (item.product.importPrice || 0);
        return { ...item, isImportUnit: newIsImportUnit, importPrice: newPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.importQuantity * item.importPrice), 0);
  };

  const handleFinish = async () => {
    if (!selectedSupplier) {
      alert("Vui lòng chọn Nhà cung cấp!");
      return;
    }
    if (cart.length === 0) {
      alert("Chưa có sản phẩm nào trong phiếu nhập!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        supplierId: parseInt(selectedSupplier),
        totalCost: calculateTotal(),
        details: cart.map(item => ({
          productId: item.product.id,
          importQuantity: item.importQuantity,
          importPrice: item.importPrice,
          subtotal: item.importQuantity * item.importPrice,
          isImportUnit: item.isImportUnit
        }))
      };

      await axios.post('http://localhost:8081/api/purchase-orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Nhập kho thành công!");
      navigate('/dashboard');
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data || err.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="po-container">
      <div className="po-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Lập Phiếu Nhập Kho</h1>
      </div>

      <div className="po-layout">
        <div className="po-left-panel">
          
          <div className="po-card">
            <h3><User size={18}/> Thông tin Nhà Cung Cấp</h3>
            <select 
              value={selectedSupplier} 
              onChange={e => setSelectedSupplier(e.target.value)}
              className="po-select"
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="po-card search-card">
            <h3><Search size={18}/> Tìm kiếm Sản phẩm</h3>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Gõ tên hoặc mã vạch sản phẩm..." 
                value={searchQuery}
                onChange={e => handleSearchProduct(e.target.value)}
              />
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map(p => (
                    <li key={p.id} onClick={() => addToCart(p)}>
                      <div className="sr-info">
                        <strong>{p.name}</strong>
                        <span>SKU: {p.sku}</span>
                      </div>
                      <div className="sr-price">Tồn: {p.stock}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

        <div className="po-right-panel">
          <div className="po-card grid-card">
            <h3><Package size={18}/> Chi tiết Nhập Kho</h3>
            <div className="table-responsive">
              <table className="po-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th width="100">Đơn vị Nhập</th>
                    <th width="120">Số lượng Nhập</th>
                    <th width="150">Giá Nhập (Vốn)</th>
                    <th width="150" className="text-right">Thành tiền</th>
                    <th width="50"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length > 0 ? cart.map(item => (
                    <tr key={item.product.id}>
                      <td>
                        <div className="grid-product-name">{item.product.name}</div>
                        <div className="grid-product-rate">Tỷ lệ quy đổi: 1 {item.product.importUnit || 'Đơn vị'} = {item.product.conversionRate || 1} {item.product.sellUnit || 'Đơn vị bán'}</div>
                      </td>
                      <td className="text-center">
                        <div className="unit-toggle-wrapper">
                          <button 
                            className={`unit-toggle ${item.isImportUnit ? 'sỉ' : 'lẻ'}`}
                            onClick={() => toggleUnit(item.product.id)}
                            title="Bấm để đổi đơn vị"
                          >
                            {item.isImportUnit ? `📦 ${item.product.importUnit || 'Sỉ'}` : `🥫 ${item.product.sellUnit || 'Lẻ'}`}
                          </button>
                        </div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          className="po-input"
                          value={item.importQuantity} 
                          onChange={e => updateCartItem(item.product.id, 'importQuantity', e.target.value)} 
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="0" 
                          className="po-input"
                          value={item.importPrice} 
                          onChange={e => updateCartItem(item.product.id, 'importPrice', e.target.value)} 
                        />
                      </td>
                      <td className="text-right font-bold text-blue">
                        {formatCurrency(item.importQuantity * item.importPrice)}
                      </td>
                      <td>
                        <button className="btn-icon text-red" onClick={() => removeFromCart(item.product.id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-cart">Chưa có sản phẩm nào trong lưới. Vui lòng tìm kiếm và thêm sản phẩm.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="po-summary">
              <div className="summary-row total">
                <span>Tổng Tiền Thanh Toán:</span>
                <span className="text-orange">{formatCurrency(calculateTotal())}</span>
              </div>
              <button className="btn-finish" onClick={handleFinish} disabled={cart.length === 0}>
                <Save size={20} /> HOÀN TẤT NHẬP KHO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;
