import { useEffect, useMemo, useState } from "react";
import "../../css/shared/admin-components.css";
import "../../css/order/OrderAdmin.css";

/* ── Helpers ────────────────────────────────────── */
const formatCurrency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const STATUS_OPTIONS = [
  { value: "pending",    label: "Chờ xử lý",  icon: "bi-hourglass-split",    cls: "pending" },
  { value: "activating", label: "Sẵn sàng lên món", icon: "bi-bell",   cls: "activating" },
  { value: "completed",  label: "Hoàn thành", icon: "bi-check-circle",       cls: "completed" },
  { value: "cancelled",  label: "Đã huỷ",     icon: "bi-x-circle",           cls: "cancelled" },
];

/* ── Sub-components ─────────────────────────────── */
const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="adm-pagination">
      <button className="adm-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
        <i className="bi bi-chevron-left" />
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} className={`adm-page-btn ${page === p ? "adm-page-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button className="adm-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
};

/* ── Main ────────────────────────────────────────── */
function Order({ query, isMerchant = false }) {
  const [orders, setOrders]             = useState([]);
  const [draftUpdates, setDraftUpdates] = useState([]);
  const [message, setMessage]           = useState("");
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({ totalPages: 1, totalItems: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0, pendingOrders: 0, dineInOrders: 0,
    deliveryOrders: 0, totalRevenue: 0, totalDeposits: 0,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query)        params.set("q",      query);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter)   params.set("type",   typeFilter);
      params.set("page", String(page));
      params.set("limit", "8");

      const endpoint = isMerchant ? `/api/restaurant/order-list?${params}` : `/api/admin/checkout/doneOrder?${params}`;
      const res  = await fetch(endpoint, { credentials: "include" });
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setPagination(data.pagination || { totalPages: 1, totalItems: 0 });
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("fetchOrders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [query, statusFilter, typeFilter, page]);

  const handleChangeStatus = (orderId, status, orderCode) => {
    setDraftUpdates(prev => {
      const idx = prev.findIndex(([id]) => id === orderId);
      const next = [...prev];
      if (idx !== -1) next[idx] = [orderId, status, orderCode];
      else next.push([orderId, status, orderCode]);
      return next;
    });
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
  };

  const handleApplyUpdates = async () => {
    if (!draftUpdates.length) return;
    try {
      let res;
      if (isMerchant) {
          // Merchant API updates status one by one usually, but let's assume we can add a bulk update endpoint, or just loop
          for (const [id, status] of draftUpdates) {
             await fetch(`/api/restaurant/orders/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status })
             });
          }
          res = { ok: true };
      } else {
          res  = await fetch("/api/admin/authenOrder", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ orderNew: draftUpdates }),
          });
      }
      
      setMessage("Cập nhật thành công!");
      setDraftUpdates([]);
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsPrintModalOpen(true);
  };

  const handlePrint = (type) => {
    // type: 'kitchen' or 'invoice'
    const printArea = document.getElementById(`print-area-${type}`);
    if (printArea) {
        const originalContent = document.body.innerHTML;
        const printContent = printArea.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Quick reset
    }
  };

  const pendingDrafts = useMemo(() => draftUpdates.length, [draftUpdates]);
  const draftIds      = useMemo(() => new Set(draftUpdates.map(([id]) => id)), [draftUpdates]);

  return (
    <div className="adm-page">

      {/* Notification */}
      {message && (
        <div className="adm-notification">
          <i className="bi bi-check-circle-fill" /> {message}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-receipt-cutoff" style={{ color: "var(--adm-info)", marginRight: 8 }} />
            {isMerchant ? "Danh sách Đơn hàng" : "Quản lý đơn hàng"}
          </h1>
          <p className="adm-page-sub">{isMerchant ? "Quản lý tất cả đơn hàng của nhà hàng bạn" : "Theo dõi và cập nhật trạng thái đơn hàng trong hệ thống"}</p>
        </div>
        {pendingDrafts > 0 && (
          <button className="adm-btn adm-btn--save" onClick={handleApplyUpdates} style={{ position: "relative" }}>
            <i className="bi bi-floppy" /> Lưu thay đổi
            <span className="adm-save-badge">{pendingDrafts}</span>
          </button>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <section className="adm-stats">
        <div className="adm-stat-card adm-stat-card--blue">
          <div className="adm-stat-icon"><i className="bi bi-receipt" /></div>
          <span className="adm-stat-label">Tổng đơn</span>
          <span className="adm-stat-value">{stats.totalOrders}</span>
          <span className="adm-stat-sub">tất cả trạng thái</span>
        </div>
        <div className="adm-stat-card adm-stat-card--orange">
          <div className="adm-stat-icon"><i className="bi bi-hourglass-split" /></div>
          <span className="adm-stat-label">Chờ xử lý</span>
          <span className="adm-stat-value">{stats.pendingOrders}</span>
          <span className="adm-stat-sub">cần phê duyệt</span>
        </div>
        <div className="adm-stat-card adm-stat-card--purple">
          <div className="adm-stat-icon"><i className="bi bi-shop" /></div>
          <span className="adm-stat-label">Đặt bàn</span>
          <span className="adm-stat-value">{stats.dineInOrders}</span>
          <span className="adm-stat-sub">tại nhà hàng</span>
        </div>
        <div className="adm-stat-card adm-stat-card--sky">
          <div className="adm-stat-icon"><i className="bi bi-truck" /></div>
          <span className="adm-stat-label">Giao hàng</span>
          <span className="adm-stat-value">{stats.deliveryOrders}</span>
          <span className="adm-stat-sub">ship tận nơi</span>
        </div>
        <div className="adm-stat-card adm-stat-card--green">
          <div className="adm-stat-icon"><i className="bi bi-graph-up-arrow" /></div>
          <span className="adm-stat-label">Doanh thu</span>
          <span className="adm-stat-value" style={{ fontSize: 17 }}>{formatCurrency(stats.totalRevenue)}</span>
          <span className="adm-stat-sub">đơn hoàn thành</span>
        </div>
        <div className="adm-stat-card adm-stat-card--red">
          <div className="adm-stat-icon"><i className="bi bi-safe" /></div>
          <span className="adm-stat-label">Tiền cọc</span>
          <span className="adm-stat-value" style={{ fontSize: 17 }}>{formatCurrency(stats.totalDeposits)}</span>
          <span className="adm-stat-sub">đặt bàn</span>
        </div>
      </section>

      {/* ── Revenue bar ── */}
      <div className="adm-revenue-bar">
        <div className="adm-revenue-item">
          <span className="adm-revenue-label">
            <i className="bi bi-graph-up-arrow" style={{ color: "var(--adm-accent)" }} />
            Doanh thu (Hoàn thành)
          </span>
          <span className="adm-revenue-value">{formatCurrency(stats.totalRevenue)}</span>
        </div>
        <div className="adm-revenue-divider" />
        <div className="adm-revenue-item">
          <span className="adm-revenue-label">
            <i className="bi bi-piggy-bank" style={{ color: "var(--adm-info)" }} />
            Cọc đặt bàn
          </span>
          <span className="adm-revenue-value" style={{ color: "var(--adm-info)" }}>{formatCurrency(stats.totalDeposits)}</span>
        </div>
        <div className="adm-revenue-divider" />
        <div className="adm-revenue-item">
          <span className="adm-revenue-label">
            <i className="bi bi-funnel" style={{ color: "var(--adm-muted)" }} />
            Kết quả tìm kiếm
          </span>
          <span className="adm-revenue-value">{pagination.totalItems || 0} đơn</span>
        </div>
      </div>

      {/* ── Draft Banner ── */}
      {pendingDrafts > 0 && (
        <div className="adm-draft-banner">
          <i className="bi bi-exclamation-triangle-fill" />
          Có <strong style={{ margin: "0 4px" }}>{pendingDrafts}</strong> thay đổi chưa được lưu.
          <button className="adm-btn adm-btn--save" onClick={handleApplyUpdates} style={{ marginLeft: "auto", position: "relative" }}>
            <i className="bi bi-floppy" /> Lưu ngay
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="adm-toolbar">
        <div className="adm-toolbar-left">
          <select className="adm-select" value={statusFilter}
            onChange={e => { setPage(1); setStatusFilter(e.target.value); }}>
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select className="adm-select" value={typeFilter}
            onChange={e => { setPage(1); setTypeFilter(e.target.value); }}>
            <option value="">Tất cả loại đơn</option>
            <option value="dine_in">Đặt bàn</option>
            <option value="delivery">Giao hàng</option>
          </select>

          {(statusFilter || typeFilter) && (
            <button className="adm-btn adm-btn--ghost"
              onClick={() => { setStatusFilter(""); setTypeFilter(""); setPage(1); }}>
              <i className="bi bi-x-lg" /> Xoá lọc
            </button>
          )}
        </div>
        <div className="adm-toolbar-right">
          <span className="adm-badge adm-badge--grey">
            <i className="bi bi-list-ul" /> {pagination.totalItems || 0} đơn hàng
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Nhà hàng</th>
              <th>Khách hàng</th>
              <th>Loại / Bàn</th>
              <th>Tổng tiền</th>
              <th>Cọc</th>
              <th>Thông tin thêm</th>
              <th>Ngày tạo</th>
              <th className="adm-th-center">Trạng thái</th>
              {isMerchant && <th className="adm-th-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="adm-loading-row">
                <td colSpan="9">
                  <div className="adm-spinner" />
                  <div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải đơn hàng...</div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="9">
                  <div className="adm-empty">
                    <div className="adm-empty-icon"><i className="bi bi-inbox" /></div>
                    <div className="adm-empty-text">Không tìm thấy đơn hàng nào</div>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id} className={draftIds.has(order._id) ? "adm-row--draft" : ""}>

                  <td>
                    <div style={{ fontWeight: 700, fontSize: 12.5, fontFamily: "var(--adm-mono)", color: "var(--adm-text)" }}>
                      #{order.orderId}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--adm-muted)", marginTop: 2 }}>
                      {order.orderGroupCode || "Đơn lẻ"}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{order.restaurantInfo?.name || "Nhà hàng"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--adm-muted)" }}>
                      <i className="bi bi-telephone" /> {order.restaurantInfo?.phone || "—"}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div className="adm-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                        {(order.userInfo?.fullName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{order.userInfo?.fullName || "N/A"}</div>
                        <div style={{ fontSize: 11.5, color: "var(--adm-muted)" }}>{order.userInfo?.phone || "N/A"}</div>
                      </div>
                    </div>
                    {order.orderType === "delivery" && (
                      <div style={{ fontSize: 11, color: "var(--adm-muted)", marginTop: 3 }}>
                        <i className="bi bi-geo-alt" /> {order.userInfo?.address || "—"}
                      </div>
                    )}
                  </td>

                  <td>
                    <span className={`adm-type-badge adm-type-badge--${order.orderType}`}>
                      <i className={`bi ${order.orderType === "delivery" ? "bi-truck" : "bi-shop"}`} />
                      {order.orderType === "delivery" ? " Giao hàng" : " Đặt bàn"}
                    </span>
                    <div style={{ fontSize: 11.5, color: "var(--adm-muted)", marginTop: 5 }}>
                      {order.orderType === "dine_in"
                        ? `Bàn ${order.tableInfo?.tableNumber || "N/A"} ${order.tableInfo?.area ? `• ${order.tableInfo.area}` : ""}`
                        : "Ship tận nơi"}
                    </div>
                  </td>

                  <td>
                    <span className="adm-amount">{formatCurrency(order.totalAmount || 0)}</span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: order.depositAmount ? "var(--adm-info)" : "var(--adm-muted-2)", fontSize: 12.5 }}>
                      {order.depositAmount ? formatCurrency(order.depositAmount) : "—"}
                    </span>
                  </td>

                  <td>
                    {order.orderType === "dine_in" ? (
                      <>
                        <div style={{ fontSize: 12, color: "var(--adm-text-2)" }}>
                          <i className="bi bi-calendar-event" /> {order.tableInfo?.visitDate || "—"} {order.tableInfo?.arrivalTime || ""}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--adm-muted)", marginTop: 3 }}>
                          {order.relativeContact?.phone
                            ? <><i className="bi bi-people" /> {order.relativeContact.fullName} · {order.relativeContact.phone}</>
                            : "Không có bàn thứ hai"}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>
                        <i className="bi bi-box-seam" /> Ship order
                      </div>
                    )}
                  </td>

                  <td>
                    <div style={{ fontSize: 12, color: "var(--adm-muted)", fontFamily: "var(--adm-mono)" }}>
                      <i className="bi bi-clock-history" /> {formatDateTime(order.createdAt)}
                    </div>
                  </td>

                  <td className="adm-td-center">
                    <select
                      className={`adm-status-select adm-status-select--${order.orderStatus}`}
                      value={order.orderStatus}
                      onChange={e => handleChangeStatus(order._id, e.target.value, order.orderId)}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  {isMerchant && (
                    <td className="adm-td-center">
                      <button className="adm-btn adm-btn--ghost" onClick={() => handleOpenDetail(order)} style={{padding: '6px 12px', fontSize: 13}}>
                        <i className="bi bi-file-text"></i> Chi tiết
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={pagination.totalPages || 1} setPage={setPage} />

      {/* Print Detail Modal */}
      {isPrintModalOpen && selectedOrder && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-content" style={{maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="adm-modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 15, marginBottom: 15}}>
              <h2 style={{fontSize: 18, margin: 0}}>Chi tiết Đơn hàng #{selectedOrder.orderId}</h2>
              <button onClick={() => setIsPrintModalOpen(false)} style={{background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}}>&times;</button>
            </div>

            <div className="adm-modal-body" style={{display: 'flex', gap: '20px'}}>
              
              {/* KITCHEN TICKET SECTION */}
              <div style={{flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', background: selectedOrder.orderStatus === 'activating' ? '#fffaf0' : '#fff'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                      <h3 style={{fontSize: 16, margin: 0, color: '#dd6b20'}}><i className="bi bi-fire"></i> Phiếu Bếp (Đầu bếp)</h3>
                      <button className="adm-btn adm-btn--save" onClick={() => handlePrint('kitchen')} style={{background: '#dd6b20', color: '#fff'}}><i className="bi bi-printer"></i> In bếp</button>
                  </div>
                  <div id="print-area-kitchen" style={{fontFamily: 'monospace', fontSize: '14px', border: '1px dashed #ccc', padding: '10px', background: '#fff', color: '#000'}}>
                      <div style={{textAlign: 'center', marginBottom: 10, borderBottom: '1px dashed #000', paddingBottom: 5}}>
                          <h2 style={{margin: 0, fontSize: 18}}>PHIẾU LÀM MÓN</h2>
                          <div>BÀN: {selectedOrder.tableInfo?.tableNumber || "GIAO HÀNG"}</div>
                          <div>Mã đơn: #{String(selectedOrder.orderId).slice(-6)}</div>
                          <div>Giờ in: {new Date().toLocaleTimeString('vi-VN')}</div>
                      </div>
                      <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                          <thead>
                              <tr style={{borderBottom: '1px dashed #000'}}>
                                  <th style={{padding: '5px 0'}}>SL</th>
                                  <th style={{padding: '5px 0'}}>Tên món</th>
                              </tr>
                          </thead>
                          <tbody>
                              {(selectedOrder.products || []).map((p, i) => (
                                  <tr key={i} style={{borderBottom: '1px dashed #ccc'}}>
                                      <td style={{padding: '5px 0', fontWeight: 'bold'}}>{p.quantity}</td>
                                      <td style={{padding: '5px 0'}}>{p.product_id?.name || p.name || 'Sản phẩm'}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* INVOICE SECTION */}
              <div style={{flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                      <h3 style={{fontSize: 16, margin: 0, color: '#3182ce'}}><i className="bi bi-receipt"></i> Hóa Đơn (Khách hàng)</h3>
                      <button className="adm-btn adm-btn--save" onClick={() => handlePrint('invoice')} style={{background: '#3182ce', color: '#fff'}}><i className="bi bi-printer"></i> In HĐ</button>
                  </div>
                  <div id="print-area-invoice" style={{fontFamily: 'monospace', fontSize: '14px', border: '1px solid #ccc', padding: '15px', background: '#fff', color: '#000'}}>
                      <div style={{textAlign: 'center', marginBottom: 15}}>
                          <h2 style={{margin: 0, fontSize: 18}}>{selectedOrder.restaurantInfo?.name || "NHÀ HÀNG"}</h2>
                          <div>{selectedOrder.restaurantInfo?.phone || ""}</div>
                          <div style={{borderTop: '1px dashed #000', margin: '10px 0'}}></div>
                          <h3 style={{margin: 0, fontSize: 16}}>HÓA ĐƠN THANH TOÁN</h3>
                          <div>Mã đơn: #{selectedOrder.orderId}</div>
                          <div>Khách: {selectedOrder.userInfo?.fullName || "Khách Vãng Lai"}</div>
                          {selectedOrder.orderType === 'dine_in' && <div>Bàn: {selectedOrder.tableInfo?.tableNumber}</div>}
                      </div>
                      <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: 15}}>
                          <thead>
                              <tr style={{borderBottom: '1px dashed #000'}}>
                                  <th style={{padding: '5px 0'}}>Món</th>
                                  <th style={{padding: '5px 0', textAlign: 'center'}}>SL</th>
                                  <th style={{padding: '5px 0', textAlign: 'right'}}>Thành tiền</th>
                              </tr>
                          </thead>
                          <tbody>
                              {(selectedOrder.products || []).map((p, i) => (
                                  <tr key={i} style={{borderBottom: '1px dashed #ccc'}}>
                                      <td style={{padding: '5px 0'}}>{p.product_id?.name || p.name || 'Sản phẩm'}</td>
                                      <td style={{padding: '5px 0', textAlign: 'center'}}>{p.quantity}</td>
                                      <td style={{padding: '5px 0', textAlign: 'right'}}>{formatCurrency((p.price || 0) * (p.quantity || 1))}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                      <div style={{textAlign: 'right', borderTop: '1px dashed #000', paddingTop: 10}}>
                          <div>Tổng cộng: <strong>{formatCurrency(selectedOrder.totalAmount)}</strong></div>
                          {selectedOrder.depositAmount > 0 && <div>Đã cọc: -{formatCurrency(selectedOrder.depositAmount)}</div>}
                          <div style={{fontSize: 16, marginTop: 5}}><strong>CẦN TT: {formatCurrency(Math.max(0, (selectedOrder.totalAmount || 0) - (selectedOrder.depositAmount || 0)))}</strong></div>
                      </div>
                  </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;