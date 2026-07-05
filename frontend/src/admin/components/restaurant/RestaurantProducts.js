import React, { useEffect, useState, useMemo } from "react";
import "../../css/MerchantProducts.css";

const RestaurantProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  
  // Side Panel State
  const [panelMode, setPanelMode] = useState(null); // 'add' | 'edit' | null
  const [currentProduct, setCurrentProduct] = useState({
    _id: "", name: "", category: "", featured: "Thường", description: "",
    price: "", discount: "", quantity: "", img: "", position: "", status: "active"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Multi-select State
  const [selectedIds, setSelectedIds] = useState([]);
  const [multiActionStatus, setMultiActionStatus] = useState("active");
  const [isLoadingMulti, setIsLoadingMulti] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/products", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStock = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/restaurant/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProducts(); // reload
      } else {
        alert("Cập nhật thất bại.");
      }
    } catch (error) {
      console.error("Toggle stock error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/restaurant/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchProducts();
        setSelectedIds(prev => prev.filter(i => i !== id));
      } else {
        alert("Xoá thất bại. API có thể chưa hỗ trợ chức năng xoá.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // MULTI ACTION
  const handleUpdateMulti = async () => {
    if (!selectedIds.length) return;
    if (multiActionStatus === "delete-all") {
      if (!window.confirm("Bạn có chắc chắn muốn xoá " + selectedIds.length + " sản phẩm đã chọn?")) return;
      setIsLoadingMulti(true);
      // Simulate bulk delete for now if API doesn't support bulk delete, or call API
      try {
        for (const id of selectedIds) {
          await fetch(`/api/restaurant/products/${id}`, { method: "DELETE", credentials: "include" });
        }
        setSelectedIds([]);
        fetchProducts();
      } finally {
        setIsLoadingMulti(false);
      }
      return;
    }

    setIsLoadingMulti(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/restaurant/products/${id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          credentials: "include", body: JSON.stringify({ status: multiActionStatus }),
        });
      }
      setSelectedIds([]);
      fetchProducts();
    } catch (error) {
      console.error("Multi update error:", error);
    } finally {
      setIsLoadingMulti(false);
    }
  };

  // ADD / EDIT SUBMIT
  const handlePanelSubmit = async (e) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.price) {
      alert("Vui lòng nhập Tên món và Giá!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = panelMode === 'edit' 
        ? `/api/restaurant/products/${currentProduct._id}`
        : "/api/restaurant/products";
      const method = panelMode === 'edit' ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: currentProduct.name,
          price: Number(currentProduct.price),
          description: currentProduct.description,
          img: currentProduct.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
          status: currentProduct.status,
          // other fields can be passed if backend supports them
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setPanelMode(null);
        fetchProducts();
      } else {
        alert(data.message || "Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Lỗi kết nối server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddPanel = () => {
    setCurrentProduct({
      _id: "", name: "", category: "", featured: "Thường", description: "",
      price: "", discount: "", quantity: "1", img: "", position: "0", status: "active"
    });
    setPanelMode("add");
  };

  const openEditPanel = (product) => {
    setCurrentProduct({
      _id: product._id,
      name: product.name || "",
      category: product.category || "",
      featured: "Thường", // Mocking since it might not be in DB
      description: product.description || "",
      price: product.price || "",
      discount: product.discount || "",
      quantity: product.quantity || "1",
      img: product.img || "",
      position: product.position || "0",
      status: product.status || "active"
    });
    setPanelMode("edit");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + " đ";
  };

  // FILTER & SORT
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeTab !== "all") {
      result = result.filter(p => p.status === activeTab);
    }
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    if (sortOption === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, activeTab, searchTerm, sortOption]);

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === "active").length,
    inactive: products.filter(p => p.status !== "active").length,
  };

  // PAGINATION
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleCheckAll = (e) => {
    if (e.target.checked) setSelectedIds(currentProducts.map(p => p._id));
    else setSelectedIds([]);
  };
  const handleCheck = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  if (loading && products.length === 0) {
    return (
      <div className="adm-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
        <div className="spinner-border text-info" role="status"></div>
        <p style={{marginLeft: 10}}>Đang tải dữ liệu thực đơn...</p>
      </div>
    );
  }

  return (
    <div className="adm-page">
      {/* ── Page Header ── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-bag-heart" style={{ color: "#1ABB9C", marginRight: 8 }}></i>
            Quản lý sản phẩm
          </h1>
          <p className="adm-page-subtitle">Tất cả sản phẩm từ các nhà hàng trong hệ thống (1 cửa hàng)</p>
        </div>
        <button className="adm-btn-primary" onClick={openAddPanel}>
          <i className="bi bi-plus-lg"></i> Thêm sản phẩm
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="adm-stat-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon total"><i className="bi bi-box-seam"></i></div>
          <h3>TỔNG SẢN PHẨM</h3>
          <p className="val">{stats.total}</p>
          <p className="desc">trên trang này</p>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon active"><i className="bi bi-check-circle"></i></div>
          <h3>ĐANG BÁN</h3>
          <p className="val">{stats.active}</p>
          <p className="desc">sản phẩm hoạt động</p>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon inactive"><i className="bi bi-pause-circle"></i></div>
          <h3>TẠM DỪNG</h3>
          <p className="val">{stats.inactive}</p>
          <p className="desc">sản phẩm dừng bán</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="adm-toolbar">
        <div className="adm-tabs">
          <button className={`adm-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setPage(1); }}>
            Tất cả
          </button>
          <button className={`adm-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => { setActiveTab('active'); setPage(1); }}>
            Hoạt động
          </button>
          <button className={`adm-tab ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => { setActiveTab('inactive'); setPage(1); }}>
            Tạm dừng
          </button>
        </div>
        <div className="adm-filters">
          <select className="adm-select" value={sortOption} onChange={(e) => { setSortOption(e.target.value); setPage(1); }}>
            <option value="default">Sắp xếp: Mặc định</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
          <div className="adm-search">
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* ── MULTI ACTION BAR ── */}
      {selectedIds.length > 0 && (
        <div className="adm-multi-bar">
          <span className="adm-multi-bar-label"><i className="bi bi-layers" style={{marginRight: 5}}></i> {selectedIds.length} sản phẩm được chọn</span>
          <select className="adm-select" style={{width: 200}} value={multiActionStatus} onChange={(e) => setMultiActionStatus(e.target.value)}>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm dừng</option>
            <option value="delete-all">Xoá đã chọn</option>
          </select>
          <button className="adm-btn-primary" style={{padding: '8px 15px'}} onClick={handleUpdateMulti} disabled={isLoadingMulti}>
            {isLoadingMulti ? "Đang xử lý..." : "Áp dụng"}
          </button>
          <button className="btn-action" style={{border: 'none', background: 'transparent'}} onClick={() => setSelectedIds([])}>
            Huỷ
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="adm-table-container">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input type="checkbox" onChange={handleCheckAll} checked={currentProducts.length > 0 && selectedIds.length === currentProducts.length} />
              </th>
              <th style={{ width: '50px' }}>STT</th>
              <th>SẢN PHẨM</th>
              <th>GIÁ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', fontStyle: 'italic', padding: 30}}>Không tìm thấy sản phẩm nào.</td></tr>
            ) : (
              currentProducts.map((p, idx) => (
                <tr key={p._id}>
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => handleCheck(p._id)} />
                  </td>
                  <td>{(page - 1) * itemsPerPage + idx + 1}</td>
                  <td>
                    <div className="product-cell">
                      <img src={p.img || "https://via.placeholder.com/150"} alt={p.name} className="product-img" />
                      <div className="product-info">
                        <p className="product-name">{p.name}</p>
                        <span className="product-id">{p._id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1ABB9C' }}>{formatPrice(p.price)}</td>
                  <td>
                    {p.status === "active" ? (
                      <span className="status-badge active"><i className="bi bi-check-circle-fill"></i> Hoạt động</span>
                    ) : (
                      <span className="status-badge inactive"><i className="bi bi-pause-circle-fill"></i> Tạm dừng</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-action" onClick={() => openEditPanel(p)} title="Chỉnh sửa">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-action delete" onClick={() => handleDelete(p._id)} title="Xoá">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="adm-pagination">
          <button className="adm-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <i className="bi bi-chevron-left"></i>
          </button>
          {Array.from({length: totalPages}).map((_, i) => (
            <button key={i} className={`adm-page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button className="adm-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}

      {/* ── Side Panel (Drawer) cho Thêm/Sửa Sản Phẩm ── */}
      {panelMode && (
        <>
          <div className="adm-side-panel-overlay" onClick={() => setPanelMode(null)}></div>
          <div className="adm-side-panel">
            <div className="adm-side-header">
              <h2>{panelMode === 'add' ? 'Tạo sản phẩm' : 'Sửa sản phẩm'}</h2>
              <button className="adm-side-close" onClick={() => setPanelMode(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            
            <div className="adm-side-body">
              <form onSubmit={handlePanelSubmit}>
                
                <div className="sp-form-group">
                  <label><i className="bi bi-box"></i> Tên sản phẩm</label>
                  <input type="text" className="sp-form-control" placeholder="Nhập tên sản phẩm..."
                    value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required />
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-shop"></i> Nhà hàng</label>
                  <input type="text" className="sp-form-control" value="Mặc định (Cửa hàng của bạn)" disabled />
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-tags"></i> Danh mục</label>
                  <select className="sp-form-control" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}>
                    <option value="">Chọn danh mục</option>
                    <option value="Đồ ăn">Đồ ăn</option>
                    <option value="Đồ uống">Đồ uống</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-star"></i> Hiển thị</label>
                  <div className="sp-radio-group">
                    <label className="sp-radio-item">
                      <input type="radio" name="featured" checked={currentProduct.featured === 'Nổi bật'} onChange={() => setCurrentProduct({...currentProduct, featured: 'Nổi bật'})} /> Nổi bật
                    </label>
                    <label className="sp-radio-item">
                      <input type="radio" name="featured" checked={currentProduct.featured === 'Thường'} onChange={() => setCurrentProduct({...currentProduct, featured: 'Thường'})} /> Thường
                    </label>
                  </div>
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-list-text"></i> Mô tả</label>
                  <textarea className="sp-form-control" placeholder="Nhập mô tả..." rows="3"
                    value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}></textarea>
                </div>

                <div style={{display: 'flex', gap: 15}}>
                  <div className="sp-form-group" style={{flex: 1}}>
                    <label>$ Giá</label>
                    <input type="number" className="sp-form-control" placeholder="Giá gốc"
                      value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} required />
                  </div>
                  <div className="sp-form-group" style={{flex: 1}}>
                    <label>% Giảm giá (%)</label>
                    <input type="number" className="sp-form-control" placeholder="Giảm giá"
                      value={currentProduct.discount} onChange={e => setCurrentProduct({...currentProduct, discount: e.target.value})} />
                  </div>
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-boxes"></i> Số lượng</label>
                  <input type="number" className="sp-form-control" placeholder="Nhập số lượng"
                    value={currentProduct.quantity} onChange={e => setCurrentProduct({...currentProduct, quantity: e.target.value})} />
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-image"></i> Ảnh (URL)</label>
                  <input type="text" className="sp-form-control" placeholder="Dán link ảnh"
                    value={currentProduct.img} onChange={e => setCurrentProduct({...currentProduct, img: e.target.value})} />
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-sort-numeric-down"></i> Vị trí</label>
                  <input type="number" className="sp-form-control" placeholder="Nhập vị trí hiển thị"
                    value={currentProduct.position} onChange={e => setCurrentProduct({...currentProduct, position: e.target.value})} />
                </div>

                <div className="sp-form-group">
                  <label><i className="bi bi-toggle-on"></i> Trạng thái</label>
                  <div className="sp-radio-group">
                    <label className="sp-radio-item">
                      <input type="radio" name="status" checked={currentProduct.status === 'active'} onChange={() => setCurrentProduct({...currentProduct, status: 'active'})} /> Hoạt động
                    </label>
                    <label className="sp-radio-item">
                      <input type="radio" name="status" checked={currentProduct.status === 'inactive'} onChange={() => setCurrentProduct({...currentProduct, status: 'inactive'})} /> Tạm dừng
                    </label>
                  </div>
                </div>

                <button type="submit" className="sp-btn-submit" disabled={isSubmitting}>
                  <i className="bi bi-check-circle"></i> {isSubmitting ? "ĐANG XỬ LÝ..." : (panelMode === 'add' ? "TẠO MỚI" : "SỬA SẢN PHẨM")}
                </button>
                <div style={{height: 20}}></div> {/* Bottom spacing */}
              </form>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default RestaurantProducts;
