import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Search, Plus, Edit2, Trash2, Tag, 
  ArrowLeft, Save, X, AlertTriangle, AlertCircle 
} from 'lucide-react';
import './ProductManagement.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  
  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Form State for Product
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    image: '',
    categoryId: '',
    minStock: 5,
    importPrice: '',
    sellPrice: '',
    importUnit: '',
    sellUnit: '',
    conversionRate: 1,
    isActive: true
  });

  // Form State for Category
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [prodRes, catRes] = await Promise.all([
        axios.get('http://localhost:8081/api/products', { headers }),
        axios.get('http://localhost:8081/api/categories', { headers })
      ]);
      
      // Ensure we always have an array
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      // In case of 204 No Content, axios might return empty string instead of array
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // --- PRODUCT LOGIC ---
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        image: product.image || '',
        categoryId: product.category ? product.category.id : '',
        minStock: product.minStock || 5,
        importPrice: product.importPrice || '',
        sellPrice: product.sellPrice || '',
        importUnit: product.importUnit || '',
        sellUnit: product.sellUnit || '',
        conversionRate: product.conversionRate || 1,
        isActive: product.active !== undefined ? product.active : (product.isActive !== undefined ? product.isActive : true)
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '', sku: '', barcode: '', image: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        minStock: 5, importPrice: '', sellPrice: '',
        importUnit: '', sellUnit: '', conversionRate: 1,
        isActive: true
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.categoryId) {
      alert("Vui lòng nhập Tên sản phẩm và Danh mục");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        name: productForm.name,
        sku: productForm.sku,
        barcode: productForm.barcode,
        image: productForm.image,
        category: { id: parseInt(productForm.categoryId) },
        minStock: parseInt(productForm.minStock) || 0,
        importPrice: parseFloat(productForm.importPrice) || 0,
        sellPrice: parseFloat(productForm.sellPrice) || 0,
        importUnit: productForm.importUnit,
        sellUnit: productForm.sellUnit,
        conversionRate: parseInt(productForm.conversionRate) || 1,
        isActive: productForm.isActive,
        active: productForm.isActive // sending both to handle Jackson behavior
      };

      if (editingProduct) {
        await axios.put(`http://localhost:8081/api/products/${editingProduct.id}`, payload, { headers });
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await axios.post('http://localhost:8081/api/products', payload, { headers });
        alert('Thêm mới sản phẩm thành công! Tồn kho đã tự động đặt về 0.');
      }
      
      setIsProductModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Không thể xóa sản phẩm. Có thể nó đang nằm trong một hóa đơn.');
    }
  };

  // --- CATEGORY LOGIC ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8081/api/categories', categoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoryForm({ name: '', description: '' });
      fetchData();
      alert('Thêm danh mục thành công!');
    } catch (err) {
      alert('Lỗi khi thêm danh mục');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Không thể xóa. Danh mục này đang chứa sản phẩm!');
    }
  };

  // --- FILTERING ---
  const filteredProducts = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (p.barcode && p.barcode.includes(searchQuery));
    const matchCat = selectedCategoryId === 'ALL' || (p.category && p.category.id.toString() === selectedCategoryId);
    return matchName && matchCat;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="pm-container">
      <div className="pm-header">
        <div className="pm-header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Quản lý Sản phẩm</h1>
        </div>
        <div className="pm-header-right">
          <button className="btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>
            <Tag size={18} style={{marginRight: '8px'}}/> Danh mục
          </button>
          <button className="btn-primary" onClick={() => handleOpenProductModal()}>
            <Plus size={18} style={{marginRight: '8px'}}/> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      <div className="pm-filters glass">
        <div className="search-bar">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc mã vạch..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="cat-filter"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="ALL">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id.toString()}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="pm-table-container glass">
        {loading ? (
          <div className="pm-loading">Đang tải dữ liệu...</div>
        ) : (
          <table className="pm-table">
            <thead>
              <tr>
                <th width="60">Ảnh</th>
                <th>Sản phẩm / SKU / Mã Vạch</th>
                <th>Danh mục</th>
                <th className="text-right">Giá vốn</th>
                <th className="text-right">Giá bán</th>
                <th className="text-center">Tồn kho</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <img src={p.image || 'https://via.placeholder.com/40'} alt={p.name} className="pm-avatar" />
                  </td>
                  <td>
                    <div className="pm-name">{p.name}</div>
                    <div className="pm-code">SKU: {p.sku || 'N/A'} | Mã: {p.barcode || 'N/A'}</div>
                  </td>
                  <td>
                    <span className="pm-badge">{p.category ? p.category.name : 'N/A'}</span>
                  </td>
                  <td className="text-right font-semibold">{formatCurrency(p.importPrice)}</td>
                  <td className="text-right font-semibold text-orange">{formatCurrency(p.sellPrice)}</td>
                  <td className="text-center">
                    <span className={`pm-stock ${p.stock <= 0 ? 'out-of-stock' : p.stock <= p.minStock ? 'low-stock' : ''}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="text-center">
                    {(p.active !== undefined ? p.active : p.isActive) ? (
                      <span className="status-active">Đang bán</span>
                    ) : (
                      <span className="status-inactive">Ngừng bán</span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="pm-actions">
                      <button className="btn-icon text-blue" onClick={() => handleOpenProductModal(p)} title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon text-red" onClick={() => handleDeleteProduct(p.id)} title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="pm-empty">Không tìm thấy sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg slide-up">
            <div className="modal-header">
              <h2>{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              <button className="btn-close" onClick={() => setIsProductModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="modal-body form-grid">
              {/* Khu vực A: Thông tin cơ bản */}
              <div className="form-section">
                <h3 className="section-title"><Package size={18}/> Thông tin cơ bản</h3>
                
                <div className="form-group">
                  <label>Tên sản phẩm <span className="req">*</span></label>
                  <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Nhập tên..." />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục <span className="req">*</span></label>
                    <select required value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})}>
                      <option value="">-- Chọn --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mức tồn tối thiểu</label>
                    <input type="number" min="0" value={productForm.minStock} onChange={e => setProductForm({...productForm, minStock: e.target.value})} />
                  </div>
                </div>

                {/* Removed barcode and sku inputs based on simplified mode */}

                <div className="form-group">
                  <label>Hình ảnh (URL)</label>
                  <input type="text" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} placeholder="https://..." />
                </div>
              </div>

              {/* Khu vực B & C */}
              <div className="form-right-column">
                
                {/* Khu vực B: Giá cả */}
                <div className="form-section">
                  <h3 className="section-title"><Tag size={18}/> Giá cả</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Giá nhập (Vốn) <span className="req">*</span></label>
                      <input type="number" required min="0" value={productForm.importPrice} onChange={e => setProductForm({...productForm, importPrice: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Giá bán lẻ <span className="req">*</span></label>
                      <input type="number" required min="0" value={productForm.sellPrice} onChange={e => setProductForm({...productForm, sellPrice: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Khu vực C: Quy đổi */}
                <div className="form-section highlight-section">
                  <h3 className="section-title"><AlertTriangle size={18} className="text-orange"/> Quy đổi đơn vị tính</h3>
                  <div className="conversion-tip">
                    <AlertCircle size={14}/> Hệ thống trừ kho theo Đơn vị Bán Lẻ. (VD: Thùng - Lon - 24).
                  </div>
                  <div className="form-row cols-3">
                    <div className="form-group">
                      <label>Đơn vị Nhập</label>
                      <input type="text" value={productForm.importUnit} onChange={e => setProductForm({...productForm, importUnit: e.target.value})} placeholder="VD: Thùng" />
                    </div>
                    <div className="form-group">
                      <label>Đơn vị Bán</label>
                      <input type="text" value={productForm.sellUnit} onChange={e => setProductForm({...productForm, sellUnit: e.target.value})} placeholder="VD: Lon" />
                    </div>
                    <div className="form-group">
                      <label>Tỷ lệ Quy đổi</label>
                      <input type="number" min="1" value={productForm.conversionRate} onChange={e => setProductForm({...productForm, conversionRate: e.target.value})} />
                    </div>
                  </div>
                </div>
                
                <div className="form-group" style={{marginTop: '20px'}}>
                  <label className="toggle-label">
                    <input type="checkbox" checked={productForm.isActive} onChange={e => setProductForm({...productForm, isActive: e.target.checked})} />
                    Trạng thái Đang bán
                  </label>
                </div>

              </div>

              <div className="modal-footer full-width">
                {!editingProduct && (
                   <div className="stock-warning">
                     Lưu ý: Tồn kho của sản phẩm mới sẽ mặc định là 0. Hãy dùng tính năng Nhập kho sau khi tạo.
                   </div>
                )}
                <button type="button" className="btn-secondary" onClick={() => setIsProductModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-primary"><Save size={18} style={{marginRight: '8px'}}/> Lưu Sản Phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL (DRAWER) */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content drawer slide-left">
            <div className="modal-header">
              <h2>Quản lý Danh mục</h2>
              <button className="btn-close" onClick={() => setIsCategoryModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveCategory} className="add-category-form">
                <input 
                  type="text" 
                  placeholder="Tên danh mục mới..." 
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                />
                <button type="submit" className="btn-primary">Thêm</button>
              </form>
              
              <div className="category-list">
                {categories.map(c => (
                  <div key={c.id} className="category-item">
                    <span>{c.name}</span>
                    <button className="btn-icon text-red" onClick={() => handleDeleteCategory(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && <p className="pm-empty">Chưa có danh mục nào.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
