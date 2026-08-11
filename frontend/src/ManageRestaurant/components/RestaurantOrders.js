import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/MerchantOrders.css";
// You can also reuse the main Dashboard css for adm-page-header, adm-stat-grid etc
import "../css/RestaurantDashboard.css"; 

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/restaurant/orders", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/restaurant/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders(); // reload
      } else {
        alert("Cập nhật trạng thái thất bại.");
      }
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const newOrders = orders.filter(o => o.orderStatus === "pending");
  const prepOrders = orders.filter(o => o.orderStatus === "activating");
  const readyOrders = orders.filter(o => o.orderStatus === "completed");

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + " đ";
  };

  if (loading) {
    return (
      <div className="adm-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
        <div className="spinner-border text-info" role="status"></div>
        <p style={{marginLeft: 10}}>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="adm-page">
      {/* ── Page Header ── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-activity" style={{ color: "#3498DB", marginRight: 8 }}></i>
            Live Orders (Bếp)
          </h1>
          <p className="adm-page-subtitle">Quản lý đơn hàng thời gian thực từ API</p>
        </div>
        <div style={{display: 'flex', gap: 15}}>
          <button className="adm-btn-primary" onClick={fetchOrders} style={{background: '#3498DB'}}>
            <i className="bi bi-arrow-clockwise"></i> Làm Mới
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="adm-stat-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon total" style={{background: '#ebf8fa', color: '#3498DB'}}><i className="bi bi-envelope-open"></i></div>
          <h3>ĐƠN MỚI (NEW)</h3>
          <p className="val">{newOrders.length}</p>
          <p className="desc">chờ xác nhận</p>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon active" style={{background: '#fef5e7', color: '#F39C12'}}><i className="bi bi-cup-straw"></i></div>
          <h3>ĐANG NẤU (PREP)</h3>
          <p className="val">{prepOrders.length}</p>
          <p className="desc">đang chuẩn bị</p>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon inactive" style={{background: '#e6f6f4', color: '#1ABB9C'}}><i className="bi bi-bag-check"></i></div>
          <h3>HOÀN THÀNH (READY)</h3>
          <p className="val">{readyOrders.length}</p>
          <p className="desc">sẵn sàng giao</p>
        </div>
      </div>

      <div className="adm-kanban-board">
        
        {/* NEW ORDERS COLUMN */}
        <div className="adm-kanban-column">
          <div className="adm-kanban-header">
            <div className="adm-kanban-title"><div className="adm-kanban-dot new"></div> New</div>
            <div className="adm-kanban-count">{newOrders.length}</div>
          </div>

          {newOrders.map((order) => (
            <div className="adm-order-card new" key={order._id}>
              <div className="adm-order-top">
                <Link to={`/restaurant-owner/order-list`} className="adm-order-id" title="Xem chi tiết đơn hàng">
                  #{order._id.slice(-6).toUpperCase()}
                </Link>
                <span className="adm-order-time"><i className="bi bi-clock"></i> Mới</span>
              </div>
              <div className="adm-order-customer">
                <i className="bi bi-person"></i> {order.userInfo?.fullName || "Khách Vãng Lai"}
              </div>
              <div className="adm-order-items">
                {order.products?.map((p, i) => (
                  <div key={i}>
                    <span>{p.product_id?.name || 'Sản phẩm'}</span>
                    <span className="item-qty">x{p.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="adm-order-bottom">
                <span className="adm-order-total">{formatPrice(order.totalAmount)}</span>
                <button className="adm-order-btn" onClick={() => updateStatus(order._id, 'activating')}>
                  <i className="bi bi-check-lg"></i> Xác Nhận
                </button>
              </div>
            </div>
          ))}
          {newOrders.length === 0 && <div style={{fontSize: 13, color: '#a0aec0', textAlign: 'center', marginTop: 20}}>Không có đơn mới</div>}
        </div>

        {/* PREPARING COLUMN */}
        <div className="adm-kanban-column">
          <div className="adm-kanban-header">
            <div className="adm-kanban-title"><div className="adm-kanban-dot prep"></div> Preparing</div>
            <div className="adm-kanban-count">{prepOrders.length}</div>
          </div>

          {prepOrders.map((order) => (
            <div className="adm-order-card prep" key={order._id}>
              <div className="adm-order-top">
                <Link to={`/restaurant-owner/order-list`} className="adm-order-id" title="Xem chi tiết đơn hàng">
                  #{order._id.slice(-6).toUpperCase()}
                </Link>
                <span className="adm-order-time alert"><i className="bi bi-fire"></i> Đang nấu</span>
              </div>
              <div className="adm-order-customer">
                <i className="bi bi-person"></i> {order.userInfo?.fullName || "Khách Vãng Lai"}
              </div>
              <div className="adm-order-items">
                {order.products?.map((p, i) => (
                  <div key={i}>
                    <span>{p.product_id?.name || 'Sản phẩm'}</span>
                    <span className="item-qty">x{p.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="adm-order-bottom">
                <span className="adm-order-total">{formatPrice(order.totalAmount)}</span>
              </div>
              <button className="adm-order-btn wide prep" onClick={() => updateStatus(order._id, 'completed')}>
                <i className="bi bi-bell"></i> Đã Xong (Ready)
              </button>
            </div>
          ))}
          {prepOrders.length === 0 && <div style={{fontSize: 13, color: '#a0aec0', textAlign: 'center', marginTop: 20}}>Không có đơn đang chuẩn bị</div>}
        </div>

        {/* READY COLUMN */}
        <div className="adm-kanban-column">
          <div className="adm-kanban-header">
            <div className="adm-kanban-title"><div className="adm-kanban-dot ready"></div> Ready / Completed</div>
            <div className="adm-kanban-count">{readyOrders.length}</div>
          </div>

          {readyOrders.map((order) => (
            <div className="adm-order-card ready" key={order._id}>
              <div className="adm-order-top">
                <Link to={`/restaurant-owner/order-list`} className="adm-order-id" title="Xem chi tiết đơn hàng">
                  #{order._id.slice(-6).toUpperCase()}
                </Link>
                <span className="adm-order-time"><i className="bi bi-check-circle"></i> Hoàn thành</span>
              </div>
              <div className="adm-order-customer">
                <i className="bi bi-person"></i> {order.userInfo?.fullName || "Khách Vãng Lai"}
              </div>
              <div className="adm-order-items" style={{marginBottom: 10}}>
                {order.products?.map((p, i) => (
                  <div key={i}>
                    <span>{p.product_id?.name || 'Sản phẩm'}</span>
                    <span className="item-qty">x{p.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="adm-order-badge" style={{background: '#e6f6f4', color: '#1ABB9C'}}>
                <i className="bi bi-check2-all"></i> Đã giao / Phục vụ xong
              </div>
            </div>
          ))}
          {readyOrders.length === 0 && <div style={{fontSize: 13, color: '#a0aec0', textAlign: 'center', marginTop: 20}}>Chưa có đơn hoàn thành</div>}
        </div>

      </div>
    </div>
  );
};

export default RestaurantOrders;
