import { useEffect, useMemo, useState } from "react";
import "../../css/shared/admin-components.css";
import "../../css/products/ProductsAdmin.css";
import CreateProducts from "../creatProduct/creatProducts";
import EditProducts from "../creatProduct/editPtoducts";

/* ── Helpers ────────────────────────────────────── */
const formatCurrency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

/* ── Pagination ─────────────────────────────────── */
const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  const range = [];
  for (let i = 1; i <= Math.min(totalPages, 7); i++) range.push(i);
  return (
    <div className="adm-pagination">
      <button className="adm-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
        <i className="bi bi-chevron-left" />
      </button>
      {range.map(p => (
        <button key={p} className={`adm-page-btn ${page === p ? "adm-page-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button className="adm-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
};

/* ── Main Component ─────────────────────────────── */
const ProductsAdmin = ({ query }) => {
  const [loading, setLoading]       = useState(true);
  const [products, setProducts]     = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab]   = useState("all");
  const [idEdit, setIdEdit]         = useState("");
  const [page, setPage]             = useState(1);
  const [sortAim, setSortAim]       = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [limitPage, setLimitPage]   = useState(10);
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [ratingFilter, setRatingFilter]         = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [newStatus, setNewStatus]     = useState("active");
  const [loadingStatusIds, setLoadingStatusIds] = useState(new Set());
  const [isLoadingMulti, setIsLoadingMulti]     = useState(false);

  const sortOptions = [
    { value: "price_asc",     label: "Giá tăng dần" },
    { value: "price_desc",    label: "Giá giảm dần" },
    { value: "position_asc",  label: "Vị trí tăng" },
    { value: "position_desc", label: "Vị trí giảm" },
  ];
  const statusOptions = [
    { value: "active",     label: "Hoạt động" },
    { value: "inactive",   label: "Tạm dừng" },
    { value: "delete-all", label: "Xoá đã chọn" },
  ];

  /* ── Fetch ────────────────────────────────────── */
  const fetchProducts = async () => {
    setLoading(true);
    const params = [];
    if (activeTab !== "all") params.push(`status=${activeTab}`);
    if (query)              params.push(`keyword=${encodeURIComponent(query)}`);
    if (page > 1)           params.push(`page=${page}`);
    if (restaurantFilter)   params.push(`restaurantId=${restaurantFilter}`);
    if (sortAim) {
      const [sortKey, sortValue] = sortAim.split("_");
      params.push(`sortKey=${sortKey}`, `sortValue=${sortValue}`);
    }
    const url = `/api/admin/products${params.length ? "?" + params.join("&") : ""}`;
    try {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 401) { window.location.href = "/admin/auth/login"; return; }
      const data = await res.json();
      setProducts(Array.isArray(data.data) ? data.data : []);
      setRestaurants(Array.isArray(data.restaurants) ? data.restaurants : []);
      setTotalPages(data.objPagination?.totalPages || 1);
      setLimitPage(data.objPagination?.limitItems || 10);
    } catch (err) {
      console.error("fetchProducts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [activeTab, query, page, sortAim, restaurantFilter]);

  const filtered = useMemo(() => {
    if (!ratingFilter) return products;
    return products.filter(p => Number(p.restaurantInfo?.ratingAverage || 0) >= Number(ratingFilter));
  }, [products, ratingFilter]);

  /* ── Stats ───────────────────────────────────── */
  const stats = useMemo(() => ({
    total:     filtered.length,
    active:    filtered.filter(p => p.status === "active").length,
    inactive:  filtered.filter(p => p.status !== "active").length,
    selected:  selectedIds.length,
  }), [filtered, selectedIds]);

  /* ── Handlers ────────────────────────────────── */
  const handleChangeStatus = async (id, status) => {
    setLoadingStatusIds(prev => new Set([...prev, id]));
    const next = status === "active" ? "inactive" : "active";
    try {
      await fetch(`/api/admin/products/change-status/${next}/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ status: next }),
      });
      fetchProducts();
    } finally {
      setLoadingStatusIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleCheckAll = e => setSelectedIds(e.target.checked ? filtered.map(p => p._id) : []);
  const handleCheck    = id => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleUpdateMulti = async () => {
    if (!selectedIds.length) return;
    setIsLoadingMulti(true);
    try {
      await fetch("/api/admin/products/change-multi", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ ids: selectedIds, newStatus }),
      });
      setSelectedIds([]);
      fetchProducts();
    } finally { setIsLoadingMulti(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Xác nhận xoá sản phẩm này?")) return;
    await fetch(`/api/admin/products/delete/${id}`, { method: "DELETE", credentials: "include" });
    fetchProducts();
  };

  return (
    <div className="adm-page">

      {/* ── Page Header ── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-bag-heart" style={{ color: "var(--adm-accent)", marginRight: 8 }} />
            Quản lý sản phẩm
          </h1>
          <p className="adm-page-sub">Tất cả sản phẩm từ các nhà hàng trong hệ thống</p>
        </div>
        <button
          className="adm-btn adm-btn--primary"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasWithBackdrop"
        >
          <i className="bi bi-plus-lg" /> Thêm sản phẩm
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <section className="adm-stats">
        <div className="adm-stat-card adm-stat-card--blue">
          <div className="adm-stat-icon"><i className="bi bi-box-seam" /></div>
          <span className="adm-stat-label">Tổng sản phẩm</span>
          <span className="adm-stat-value">{stats.total}</span>
          <span className="adm-stat-sub">trên trang này</span>
        </div>
        <div className="adm-stat-card adm-stat-card--green">
          <div className="adm-stat-icon"><i className="bi bi-check-circle" /></div>
          <span className="adm-stat-label">Đang bán</span>
          <span className="adm-stat-value">{stats.active}</span>
          <span className="adm-stat-sub">sản phẩm hoạt động</span>
        </div>
        <div className="adm-stat-card adm-stat-card--red">
          <div className="adm-stat-icon"><i className="bi bi-pause-circle" /></div>
          <span className="adm-stat-label">Tạm dừng</span>
          <span className="adm-stat-value">{stats.inactive}</span>
          <span className="adm-stat-sub">sản phẩm dừng bán</span>
        </div>
        <div className="adm-stat-card adm-stat-card--orange">
          <div className="adm-stat-icon"><i className="bi bi-shop" /></div>
          <span className="adm-stat-label">Cửa hàng</span>
          <span className="adm-stat-value">{restaurants.length}</span>
          <span className="adm-stat-sub">nhà hàng tham gia</span>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className="adm-toolbar">
        <div className="adm-toolbar-left">
          <div className="adm-tabs">
            {[
              { key: "all",      label: "Tất cả",    count: null },
              { key: "active",   label: "Hoạt động" },
              { key: "inactive", label: "Tạm dừng" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`adm-tab ${activeTab === key ? "adm-tab--active" : ""}`}
                onClick={() => { setPage(1); setActiveTab(key); setSelectedIds([]); }}
              >
                {label}
              </button>
            ))}
          </div>

          <select className="adm-select" value={sortAim} onChange={e => setSortAim(e.target.value)}>
            <option value="">Sắp xếp</option>
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select className="adm-select" value={restaurantFilter}
            onChange={e => { setPage(1); setRestaurantFilter(e.target.value); }}>
            <option value="">Tất cả cửa hàng</option>
            {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>

          <select className="adm-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
            <option value="">Lọc rating</option>
            <option value="4">⭐ Từ 4 sao</option>
            <option value="4.5">⭐ Từ 4.5 sao</option>
          </select>

          {(sortAim || restaurantFilter || ratingFilter) && (
            <button className="adm-btn adm-btn--ghost" onClick={() => { setSortAim(""); setRestaurantFilter(""); setRatingFilter(""); }}>
              <i className="bi bi-x-lg" /> Xoá lọc
            </button>
          )}
        </div>

        <div className="adm-toolbar-right">
          {selectedIds.length > 0 && (
            <span className="adm-badge adm-badge--info">
              <i className="bi bi-check2-square" /> {selectedIds.length} đã chọn
            </span>
          )}
        </div>
      </div>

      {/* ── Multi-action bar ── */}
      {selectedIds.length > 0 && (
        <div className="adm-multi-bar">
          <i className="bi bi-layers" style={{ color: "var(--adm-accent-dark)" }} />
          <span className="adm-multi-bar-label">{selectedIds.length} sản phẩm được chọn</span>
          <select className="adm-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="adm-btn adm-btn--primary" onClick={handleUpdateMulti} disabled={isLoadingMulti}>
            <i className="bi bi-check-lg" /> {isLoadingMulti ? "Đang xử lý..." : "Áp dụng"}
          </button>
          <button className="adm-btn adm-btn--ghost" onClick={() => setSelectedIds([])}>
            <i className="bi bi-x" /> Huỷ
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" className="adm-checkbox"
                  onChange={handleCheckAll}
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                />
              </th>
              <th style={{ width: 50 }}>STT</th>
              <th style={{ width: 60 }}>Ảnh</th>
              <th>Sản phẩm</th>
              <th>Cửa hàng</th>
              <th className="adm-th-center">Rating</th>
              <th>Giá</th>
              <th className="adm-th-center">Trạng thái</th>
              <th className="adm-th-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="adm-loading-row">
                <td colSpan="9">
                  <div className="adm-spinner" />
                  <div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9">
                  <div className="adm-empty">
                    <div className="adm-empty-icon"><i className="bi bi-inbox" /></div>
                    <div className="adm-empty-text">Không có sản phẩm nào</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={item._id} className={selectedIds.includes(item._id) ? "adm-row--selected" : ""}>
                  <td>
                    <input type="checkbox" className="adm-checkbox"
                      checked={selectedIds.includes(item._id)}
                      onChange={() => handleCheck(item._id)}
                    />
                  </td>

                  <td className="adm-row-idx">{limitPage * (page - 1) + i + 1}</td>

                  <td>
                    {item.img
                      ? <img src={item.img} alt={item.name} className="adm-product-img" />
                      : <div className="adm-product-img-placeholder"><i className="bi bi-image" /></div>
                    }
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--adm-text)" }}>{item.name}</div>
                    {item.category && (
                      <span className="adm-badge adm-badge--grey" style={{ marginTop: 4 }}>{item.category}</span>
                    )}
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <i className="bi bi-shop" style={{ color: "var(--adm-info)", fontSize: 12 }} />
                      <span style={{ fontSize: 12.5 }}>{item.restaurantInfo?.name || "—"}</span>
                    </div>
                  </td>

                  <td className="adm-td-center">
                    <span style={{ color: "#f39c12", fontWeight: 700, fontSize: 12.5 }}>
                      <i className="bi bi-star-fill" style={{ fontSize: 10, marginRight: 3 }} />
                      {Number(item.restaurantInfo?.ratingAverage || 0).toFixed(1)}
                    </span>
                  </td>

                  <td>
                    <span className="adm-price">{formatCurrency(item.price)}</span>
                  </td>

                  <td className="adm-td-center">
                    <button
                      className={`adm-status-btn adm-status-btn--${item.status}`}
                      onClick={() => handleChangeStatus(item._id, item.status)}
                      disabled={loadingStatusIds.has(item._id)}
                    >
                      {loadingStatusIds.has(item._id) ? (
                        <><i className="bi bi-arrow-repeat" /> ...</>
                      ) : item.status === "active" ? (
                        <><i className="bi bi-check-circle-fill" /> Hoạt động</>
                      ) : (
                        <><i className="bi bi-pause-circle-fill" /> Tạm dừng</>
                      )}
                    </button>
                  </td>

                  <td className="adm-td-center">
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn--edit adm-btn--icon"
                        title="Chỉnh sửa"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasEditProduct"
                        onClick={() => setIdEdit(item._id)}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        className="adm-btn adm-btn--danger adm-btn--icon"
                        title="Xoá"
                        onClick={() => handleDelete(item._id)}
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      <CreateProducts setProducts={setProducts} />
      <EditProducts idEdit={idEdit} setProducts={setProducts} />
    </div>
  );
};

export default ProductsAdmin;