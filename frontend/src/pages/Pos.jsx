import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Package, Trash2, Plus, Minus, User, Phone, CheckCircle2, Clock, XCircle, PauseCircle, Award, LogOut } from 'lucide-react';
import './Pos.css';

const Pos = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);

  const [customerSearch, setCustomerSearch] = useState('');
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const [currentDraftOrderId, setCurrentDraftOrderId] = useState(null);
  const [draftOrders, setDraftOrders] = useState([]);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);

  // CHẶNG 6: Tích điểm & Dùng điểm
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUseInput, setPointsToUseInput] = useState('');

  // CHẶNG 6: Khuyến mãi (Voucher)
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  const fetchDraftOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8081/api/orders?status=DRAFT', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDraftOrders(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy đơn treo", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const prodRes = await axios.get('http://localhost:8081/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const safeData = prodRes.data.map(p => ({
          id: p.id,
          name: p.name,
          sellPrice: p.sellPrice,
          image: p.image || null,
          barcode: p.barcode,
          conversionRate: p.conversionRate || 1,
          importUnit: p.importUnit || 'Sỉ',
          sellUnit: p.sellUnit || 'Lẻ'
        }));
        setProducts(safeData);

        try {
          const custRes = await axios.get('http://localhost:8081/api/customers', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (custRes.data) {
              setCustomers(custRes.data);
          }
        } catch (e) { }

        await fetchDraftOrders();
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const query = debouncedQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.barcode && p.barcode.toLowerCase().includes(query))
    );
  }, [debouncedQuery, products]);

  useEffect(() => {
    if (searchQuery.trim().length > 0 && filteredProducts.length > 0) {
      setIsDropdownOpen(true);
      if (selectedIndex === -1) setSelectedIndex(0);
    } else {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }
  }, [searchQuery, filteredProducts]);

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || filteredProducts.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
        addToCart(filteredProducts[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existingProduct = prev.find(item => item.id === product.id);
      if (existingProduct) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, baseSellPrice: product.sellPrice, quantity: 1, isImportUnit: false }];
    });
    setSearchQuery('');
    setDebouncedQuery('');
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const toggleUnit = (id) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newIsImportUnit = !item.isImportUnit;
        const newPrice = newIsImportUnit 
            ? item.baseSellPrice * item.conversionRate
            : item.baseSellPrice;
        return { ...item, isImportUnit: newIsImportUnit, sellPrice: newPrice };
      }
      return item;
    }));
  };

  const updateQuantity = (id, newQuantityStr) => {
    if (newQuantityStr === '') {
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: '' } : item));
        return;
    }
    const validQuantity = isNaN(parseInt(newQuantityStr, 10)) ? 0 : parseInt(newQuantityStr, 10);
    if (validQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: validQuantity } : item));
    }
  };

  const handleQuantityBlur = (id, quantity) => {
    if (quantity === '' || quantity <= 0) {
        setCart(prev => prev.filter(item => item.id !== id));
    }
  };

  const removeItem = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.sellPrice * (parseInt(item.quantity) || 0)), 0);
  }, [cart]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    if (debouncedCustomerSearch.trim().length > 0) {
      const q = debouncedCustomerSearch.toLowerCase();
      setFilteredCustomers(customers.filter(c => c.phone && c.phone.includes(q)));
      setIsCustomerDropdownOpen(true);
    } else {
      setFilteredCustomers([]);
      setIsCustomerDropdownOpen(false);
    }
  }, [debouncedCustomerSearch, customers]);

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerSearch('');
    setIsCustomerDropdownOpen(false);
    setUsePoints(false);
    setPointsToUseInput('');
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setUsePoints(false);
    setPointsToUseInput('');
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      alert('Vui lòng nhập tên khách hàng!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
         name: newCustomerName,
         phone: customerSearch,
         points: 0,
         membershipTier: 'ĐỒNG'
      };
      const res = await axios.post('http://localhost:8081/api/customers', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers([...customers, res.data]);
      handleSelectCustomer(res.data);
      setShowAddCustomerModal(false);
    } catch (e) {
      alert('Lỗi khi thêm khách hàng!');
    }
  };

  // CHẶNG 6: Logic Tính Toán Khuyến Mãi Điểm
  const maxPointsAllowed = useMemo(() => {
    if (!selectedCustomer) return 0;
    const maxByBill = Math.floor(totalPrice / 100);
    return Math.min(selectedCustomer.points || 0, maxByBill);
  }, [selectedCustomer, totalPrice]);

  const pointsToUse = useMemo(() => {
    if (!usePoints || !selectedCustomer) return 0;
    const val = parseInt(pointsToUseInput, 10);
    if (isNaN(val) || val < 0) return 0;
    return Math.min(val, maxPointsAllowed);
  }, [usePoints, pointsToUseInput, maxPointsAllowed, selectedCustomer]);

  const pointsDiscountAmount = pointsToUse * 100;

  const promoDiscountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    return appliedVoucher.discountAmount || 0;
  }, [appliedVoucher]);

  const finalPrice = Math.max(totalPrice - promoDiscountAmount - pointsDiscountAmount, 0);
  
  const numericPaidAmount = parseFloat(paidAmount) || 0;
  const changeAmount = numericPaidAmount - finalPrice;
  const isPayDisabled = cart.length === 0 || changeAmount < 0;

  // CHẶNG 6: Cảnh báo rớt hạng
  const tierWarning = useMemo(() => {
    if (!selectedCustomer) return null;
    
    let multiplier = 1.0;
    if (selectedCustomer.membershipTier === 'KIM CƯƠNG') multiplier = 2.0;
    else if (selectedCustomer.membershipTier === 'VÀNG') multiplier = 1.5;
    else if (selectedCustomer.membershipTier === 'BẠC') multiplier = 1.2;

    const baseEarned = Math.floor(finalPrice / 10000);
    const earnedPoints = Math.round(baseEarned * multiplier);
    const finalBalance = selectedCustomer.points - pointsToUse + earnedPoints;
    
    const getTierLevel = (pts) => {
        if (pts >= 1500) return { name: 'KIM CƯƠNG', level: 4 };
        if (pts >= 500) return { name: 'VÀNG', level: 3 };
        if (pts >= 200) return { name: 'BẠC', level: 2 };
        return { name: 'ĐỒNG', level: 1 };
    };

    const currentTierLevel = getTierLevel(selectedCustomer.points);
    const newTierLevel = getTierLevel(finalBalance);

    if (newTierLevel.level < currentTierLevel.level) {
        return `Sử dụng mức điểm này sẽ khiến khách rớt xuống hạng ${newTierLevel.name}!`;
    }
    return null;
  }, [selectedCustomer, pointsToUse, finalPrice]);

  const appliedVoucherCode = appliedVoucher?.code;
  useEffect(() => {
    if (appliedVoucherCode) {
      const fetchUpdatedDiscount = async () => {
        try {
          const orderDetailsPayload = cart.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              sellPrice: item.sellPrice,
              subtotal: item.sellPrice * (parseInt(item.quantity) || 0)
          }));
          const token = localStorage.getItem('token');
          const res = await axios.post('http://localhost:8081/api/promotions/apply', { 
              code: appliedVoucherCode, 
              orderTotal: totalPrice,
              orderDetails: orderDetailsPayload
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setAppliedVoucher(prev => {
              if (prev && prev.discountAmount === res.data.discountAmount) return prev;
              return { ...res.data.promotion, discountAmount: res.data.discountAmount };
          });
          setVoucherError('');
        } catch(e) {
          setAppliedVoucher(null);
          setVoucherError('Giỏ hàng thay đổi khiến mã ' + appliedVoucherCode + ' không còn hợp lệ');
        }
      };
      
      const timer = setTimeout(fetchUpdatedDiscount, 500);
      return () => clearTimeout(timer);
    }
  }, [cart, totalPrice, appliedVoucherCode]);

  const resetCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPaidAmount('');
    setPaymentMethod('CASH');
    setSearchQuery('');
    setCurrentDraftOrderId(null);
    setUsePoints(false);
    setPointsToUseInput('');
    setVoucherCodeInput('');
    setAppliedVoucher(null);
    setVoucherError('');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleCancelUIOrder = () => {
    if(window.confirm('Hủy đơn hàng hiện tại trên màn hình?')) resetCart();
  };

  const buildPayload = (status) => {
    const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
      try {
        const p = JSON.parse(atob(token.split('.')[1]));
        userId = p.userId || p.id;
      } catch(e) {}
    }

    return {
      userId: userId,
      customerId: selectedCustomer ? selectedCustomer.id : null,
      totalPrice: totalPrice,
      paidAmount: numericPaidAmount,
      changeAmount: changeAmount < 0 ? 0 : changeAmount,
      status: status,
      paymentMethod: paymentMethod,
      usedPoints: pointsToUse,
      discountAmount: pointsDiscountAmount,
      promotionId: appliedVoucher ? appliedVoucher.id : null,
      promotionDiscount: promoDiscountAmount,
      orderDetails: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        sellPrice: item.sellPrice,
        isImportUnit: item.isImportUnit || false
      }))
    };
  };

  const handleHoldOrder = async () => {
    if (cart.length === 0) return;
    try {
      const payload = buildPayload('DRAFT');
      const token = localStorage.getItem('token');
      
      if (currentDraftOrderId) {
        await axios.put(`http://localhost:8081/api/orders/${currentDraftOrderId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:8081/api/orders', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      alert('Treo đơn thành công!');
      resetCart();
      fetchDraftOrders();
    } catch(err) {
      alert('Treo đơn thất bại!');
    }
  };

  const handleCancelDraft = async (orderId, e) => {
    e.stopPropagation();
    if(!window.confirm('Hủy đơn đang treo này (CANCELED)? Tồn kho và Điểm không bị ảnh hưởng.')) return;
    try {
      const token = localStorage.getItem('token');
      const orderToCancel = draftOrders.find(o => o.id === orderId);
      if(!orderToCancel) return;
      
      const payload = { ...orderToCancel, status: 'CANCELED' };
      // Map orderDetails back
      payload.orderDetails = orderToCancel.orderDetails.map(d => ({
          productId: d.product.id,
          quantity: d.quantity,
          sellPrice: d.sellPrice
      }));

      await axios.put(`http://localhost:8081/api/orders/${orderId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
      });
      alert('Hủy đơn treo thành công!');
      fetchDraftOrders();
      if(currentDraftOrderId === orderId) resetCart();
    } catch(err) {
      alert('Hủy đơn treo thất bại!');
    }
  };

  const handleRecallOrder = (draftOrder) => {
     setCurrentDraftOrderId(draftOrder.id);
     if(draftOrder.customer) setSelectedCustomer(draftOrder.customer);
     else setSelectedCustomer(null);
     
     const mappedCart = draftOrder.orderDetails.map(detail => ({
         id: detail.product.id,
         name: detail.product.name,
         sellPrice: detail.sellPrice,
         quantity: detail.quantity
     }));
     setCart(mappedCart);
     setUsePoints(draftOrder.usedPoints > 0);
     setPointsToUseInput(draftOrder.usedPoints > 0 ? draftOrder.usedPoints.toString() : '');
     if (draftOrder.promotion) {
         // Cần gọi lại API để Backend tính lại discountAmount dựa trên giỏ hàng
         const mappedCartDetails = draftOrder.orderDetails.map(detail => ({
            productId: detail.product.id,
            quantity: detail.quantity,
            sellPrice: detail.sellPrice,
            subtotal: detail.sellPrice * (parseInt(detail.quantity) || 0)
         }));
         const token = localStorage.getItem('token');
         axios.post('http://localhost:8081/api/promotions/apply', { 
            code: draftOrder.promotion.code, 
            orderTotal: draftOrder.totalPrice,
            orderDetails: mappedCartDetails
         }, {
            headers: { Authorization: `Bearer ${token}` }
         }).then(res => {
            setAppliedVoucher({ ...res.data.promotion, discountAmount: res.data.discountAmount });
         }).catch(() => {
            setAppliedVoucher(null);
            setVoucherError('Mã trong đơn treo không còn hợp lệ');
         });
     } else {
         setAppliedVoucher(null);
     }
     setVoucherCodeInput('');
     setVoucherError('');
     setIsDraftsOpen(false);
  };

  const handleCheckout = async () => {
    if (isPayDisabled) return;
    try {
      const payload = buildPayload('COMPLETED');
      const token = localStorage.getItem('token');

      if (currentDraftOrderId) {
         await axios.put(`http://localhost:8081/api/orders/${currentDraftOrderId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
         await axios.post('http://localhost:8081/api/orders', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      alert('✅ Thanh toán thành công! Hệ thống đã trừ kho và xử lý Điểm thưởng.');
      
      // Update local customer points and tier to avoid fetching again just for next bill
      if (selectedCustomer) {
        let multiplier = 1.0;
        if (selectedCustomer.membershipTier === 'KIM CƯƠNG') multiplier = 2.0;
        else if (selectedCustomer.membershipTier === 'VÀNG') multiplier = 1.5;
        else if (selectedCustomer.membershipTier === 'BẠC') multiplier = 1.2;

        const baseEarned = Math.floor(finalPrice / 10000);
        const earned = Math.round(baseEarned * multiplier);
        const fb = selectedCustomer.points - pointsToUse + earned;
        
        let nt = "ĐỒNG";
        if (fb >= 1500) nt = "KIM CƯƠNG";
        else if (fb >= 500) nt = "VÀNG";
        else if (fb >= 200) nt = "BẠC";

        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, points: fb, membershipTier: nt } : c));
        // Also update selectedCustomer to reflect instantly on UI if it's still selected
        setSelectedCustomer(prev => ({ ...prev, points: fb, membershipTier: nt }));
      }

      resetCart();
      fetchDraftOrders();
    } catch (error) {
      alert('❌ Thanh toán thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'F11') {
        e.preventDefault();
        handleHoldOrder();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cart, paidAmount, totalPrice, selectedCustomer, paymentMethod, currentDraftOrderId, pointsToUseInput, usePoints, appliedVoucher]); 

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getTierColor = (tier) => {
      if (!tier) return '#64748b'; // default
      const t = tier.toUpperCase();
      if (t === 'KIM CƯƠNG') return '#06b6d4'; // cyan
      if (t === 'VÀNG') return '#eab308'; // yellow
      if (t === 'BẠC') return '#94a3b8'; // gray
      return '#d97706'; // ĐỒNG - bronze
  };

  return (
    <div className="pos-container">
      {/* BÊN TRÁI */}
      <div className="pos-left">
        <div className="pos-header">
          <div className="search-wrapper">
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Gõ tên hoặc mã vạch (Enter để thêm)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            
            {isDropdownOpen && filteredProducts.length > 0 && (
              <div className="search-dropdown">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    <div className="dropdown-item-info">
                      <span className="dropdown-name">{product.name}</span>
                      <span className="dropdown-barcode">{product.barcode}</span>
                    </div>
                    <span className="dropdown-price">{formatPrice(product.sellPrice)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            <button className="btn-draft-list" onClick={() => navigate('/orders/history')} style={{marginRight: '10px'}}>
              <Clock size={24} color="#334155" />
              <span className="draft-text">Lịch sử Giao dịch</span>
            </button>
            <button className="btn-draft-list" onClick={() => setIsDraftsOpen(!isDraftsOpen)}>
              <Clock size={24} color="#334155" />
              {draftOrders.length > 0 && <span className="draft-badge">{draftOrders.length}</span>}
              <span className="draft-text">Đơn treo</span>
            </button>
            {isDraftsOpen && (
              <div className="drafts-dropdown">
                <div className="drafts-header">Danh sách Đơn treo</div>
                {draftOrders.length === 0 ? (
                  <div className="drafts-empty">Không có đơn treo.</div>
                ) : (
                  draftOrders.map(draft => (
                    <div key={draft.id} className="draft-item" onClick={() => handleRecallOrder(draft)}>
                      <div className="draft-info">
                        <span className="draft-time">#{draft.id} - {new Date(draft.createdAt).toLocaleTimeString()}</span>
                        <span className="draft-customer">{draft.customer ? draft.customer.name : 'Khách lẻ'}</span>
                        <span className="draft-total">{formatPrice(draft.totalPrice)}</span>
                      </div>
                      <button className="btn-cancel-draft" onClick={(e) => handleCancelDraft(draft.id, e)} title="Hủy đơn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            <button className="pos-logout-btn" onClick={handleLogout} title="Đăng xuất">
              <LogOut size={24} color="#e53e3e" />
            </button>
          </div>
        </div>
        
        <div className="pos-grid-wrapper">
          {loading ? (
            <div className="loading-state">Đang tải dữ liệu hàng hóa...</div>
          ) : (
            <div className="pos-grid">
              {products.map(product => (
                <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                  <div className="product-image-container">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="product-image" />
                    ) : (
                      <div className="product-placeholder">
                        <Package size={48} color="#94a3b8" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name" title={product.name}>{product.name}</h3>
                    <p className="product-price">{formatPrice(product.sellPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BÊN PHẢI */}
      <div className="pos-right">
        {/* CRM */}
        <div className="crm-header">
          {!selectedCustomer ? (
            <div className="crm-search-wrapper">
              <div className="crm-search-bar">
                <Phone className="crm-icon" size={16} />
                <input 
                  type="text" 
                  placeholder="Nhập SĐT khách hàng..." 
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
              {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                <div className="crm-dropdown">
                  {filteredCustomers.map(cust => (
                    <div key={cust.id} className="crm-dropdown-item" onClick={() => handleSelectCustomer(cust)}>
                      <div className="crm-name">{cust.name}</div>
                      <div className="crm-phone">{cust.phone}</div>
                    </div>
                  ))}
                </div>
              )}
              {customerSearch.trim().length >= 10 && filteredCustomers.length === 0 && (
                 <div className="crm-dropdown">
                    <div className="crm-dropdown-add-btn" onClick={() => { setShowAddCustomerModal(true); setNewCustomerName(''); }}>
                        <Plus size={16} style={{marginRight: '6px'}}/> Thêm khách mới: {customerSearch}
                    </div>
                 </div>
              )}
            </div>
          ) : (
            <div className="crm-selected">
              <div className="crm-selected-info">
                <User size={24} style={{color: getTierColor(selectedCustomer.membershipTier)}} />
                <div className="crm-details">
                  <span className="crm-selected-name" style={{color: getTierColor(selectedCustomer.membershipTier)}}>{selectedCustomer.name}</span>
                  <span className="crm-selected-tier">
                    Hạng: <b>{selectedCustomer.membershipTier || 'ĐỒNG'}</b> - {selectedCustomer.points || 0} điểm
                  </span>
                </div>
              </div>
              <button className="crm-clear-btn" onClick={handleClearCustomer}>✕</button>
            </div>
          )}
        </div>

        {currentDraftOrderId && (
          <div className="draft-active-banner">Đang xử lý Đơn treo #{currentDraftOrderId}</div>
        )}

        {/* GIỎ HÀNG */}
        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-header">
                  <span className="cart-item-name">{item.name}</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <button 
                      className={`unit-toggle ${item.isImportUnit ? 'sỉ' : 'lẻ'}`}
                      onClick={() => toggleUnit(item.id)}
                      title="Bấm để đổi đơn vị"
                      style={{padding: '4px 8px', fontSize: '11px'}}
                    >
                      {item.isImportUnit ? `📦 ${item.importUnit || 'Thùng'}` : `🥫 ${item.sellUnit || 'Lẻ'}`}
                    </button>
                    <button className="btn-remove" onClick={() => removeItem(item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-price-unit">{formatPrice(item.sellPrice)}</div>
                  <div className="cart-quantity-control">
                    <button className="btn-qty" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <input 
                      type="number" 
                      className="input-qty" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.id, e.target.value)}
                      onBlur={() => handleQuantityBlur(item.id, item.quantity)}
                      min="0"
                    />
                    <button className="btn-qty" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="cart-item-subtotal">
                    {formatPrice(item.sellPrice * (item.quantity || 0))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* THANH TOÁN */}
        <div className="checkout-footer">
          <div className="cancel-order-row">
            <button className="btn-cancel-ui" onClick={handleCancelUIOrder} disabled={cart.length === 0}>
              <XCircle size={16} style={{marginRight: '6px'}} /> Làm mới
            </button>
          </div>

          <div className="checkout-row">
            <span className="checkout-label">Tổng tiền:</span>
            <span className="checkout-total">{formatPrice(totalPrice)}</span>
          </div>

          {/* CHẶNG 6: ÁP MÃ VOUCHER */}
          {cart.length > 0 && (
            <div className="voucher-section">
              <div className="voucher-input-wrapper">
                <input 
                  type="text" 
                  className="voucher-input"
                  placeholder="Nhập mã khuyến mãi..." 
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedVoucher}
                />
                {!appliedVoucher ? (
                  <button 
                    className="btn-apply-voucher" 
                    onClick={async () => {
                        if(!voucherCodeInput) return;
                        setVoucherError('');
                        try {
                            const orderDetailsPayload = cart.map(item => ({
                                productId: item.id,
                                quantity: item.quantity,
                                sellPrice: item.sellPrice,
                                subtotal: item.sellPrice * (parseInt(item.quantity) || 0)
                            }));
                            const token = localStorage.getItem('token');
                            const res = await axios.post('http://localhost:8081/api/promotions/apply', { 
                                code: voucherCodeInput, 
                                orderTotal: totalPrice,
                                orderDetails: orderDetailsPayload
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            setAppliedVoucher({ ...res.data.promotion, discountAmount: res.data.discountAmount });
                        } catch(e) {
                            setVoucherError(e.response?.data?.message || 'Mã không hợp lệ');
                        }
                    }}
                  >
                    Áp dụng
                  </button>
                ) : (
                  <button 
                    className="btn-remove-voucher" 
                    onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherCodeInput('');
                        setVoucherError('');
                    }}
                  >
                    Xóa
                  </button>
                )}
              </div>
              {voucherError && <div className="voucher-error text-red text-sm mt-1">{voucherError}</div>}
              {appliedVoucher && (
                <div className="voucher-success text-green text-sm mt-1 flex justify-between">
                  <span>Mã <b>{appliedVoucher.code}</b> đã áp dụng</span>
                  <span className="font-bold">- {formatPrice(promoDiscountAmount)}</span>
                </div>
              )}
            </div>
          )}

          {/* CHẶNG 6: DÙNG ĐIỂM */}
          {selectedCustomer && cart.length > 0 && (
            <div className="points-section">
              <label className="points-toggle">
                <input 
                  type="checkbox" 
                  checked={usePoints} 
                  onChange={(e) => {
                    setUsePoints(e.target.checked);
                    if(!e.target.checked) setPointsToUseInput('');
                  }} 
                />
                <span className="points-toggle-label">
                  <Award size={16} style={{marginRight: '4px'}}/> Sử dụng điểm tích lũy
                </span>
              </label>
              {usePoints && (
                <div className="points-input-row">
                  <input 
                    type="number" 
                    className="points-input"
                    placeholder={`Tối đa ${maxPointsAllowed} điểm`}
                    value={pointsToUseInput}
                    onChange={(e) => setPointsToUseInput(e.target.value)}
                    max={maxPointsAllowed}
                    min="0"
                  />
                  {pointsToUse > 0 && (
                    <span className="points-discount-preview">- {formatPrice(pointsDiscountAmount)}</span>
                  )}
                </div>
              )}
              {usePoints && tierWarning && (
                <div className="tier-warning-text">⚠️ {tierWarning}</div>
              )}
            </div>
          )}

          <div className="checkout-row checkout-final-price">
            <span className="checkout-label">Khách Cần Trả:</span>
            <span className="checkout-total text-blue">{formatPrice(finalPrice)}</span>
          </div>

          <div className="checkout-row checkout-input-row">
            <span className="checkout-label">Khách đưa:</span>
            <div className="paid-input-wrapper">
              <input 
                type="number" 
                className="paid-input" 
                placeholder="0"
                step="1000"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleCheckout(); }}
              />
              <span className="paid-currency">đ</span>
            </div>
          </div>

          <div className="checkout-row">
            <span className="checkout-label">Tiền thối:</span>
            <span className={`checkout-change ${changeAmount < 0 ? 'text-red' : 'text-green'}`}>
              {paidAmount === '' ? '---' : formatPrice(changeAmount)}
            </span>
          </div>

          <div className="payment-methods">
            <label className={`pm-label ${paymentMethod === 'CASH' ? 'active' : ''}`}>
              <input type="radio" name="payment" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} />
              Tiền mặt
            </label>
            <label className={`pm-label ${paymentMethod === 'BANK_TRANSFER' ? 'active' : ''}`}>
              <input type="radio" name="payment" value="BANK_TRANSFER" checked={paymentMethod === 'BANK_TRANSFER'} onChange={(e) => setPaymentMethod(e.target.value)} />
              CK
            </label>
          </div>

          <div className="checkout-action-buttons">
            <button 
              className="btn-hold" 
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
            >
              <PauseCircle size={20} style={{marginRight: '4px'}} /> TREO (F11)
            </button>
            <button 
              className={`btn-checkout ${isPayDisabled ? 'disabled' : ''}`}
              onClick={handleCheckout}
              disabled={isPayDisabled}
            >
              <CheckCircle2 size={24} style={{marginRight: '8px'}} /> THANH TOÁN (F12)
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content add-customer-modal">
            <h3 className="modal-title">Thêm Khách Hàng Nhanh</h3>
            <div className="modal-body">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="text" value={customerSearch} disabled className="input-disabled" />
              </div>
              <div className="form-group">
                <label>Họ và Tên <span className="text-red">*</span></label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Nhập tên khách hàng..." 
                  value={newCustomerName} 
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleAddCustomer(); }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel-ui" onClick={() => setShowAddCustomerModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={handleAddCustomer}>Lưu Khách Hàng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pos;
