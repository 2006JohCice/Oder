import { useState, useEffect } from "react";
import "../../css/RestaurantDashboard.css";

const RestaurantDashboard = ({ restaurant }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [restaurant]);

  const loadStats = async () => {
    try {
      // Load products count
      const productsRes = await fetch("/api/restaurant/products");
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setStats(prev => ({ ...prev, totalProducts: productsData.products.length }));
      }

      // TODO: Load orders stats when orders API is ready
      // For now, set dummy data
      setStats(prev => ({
        ...prev,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
      }));
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải thống kê...</div>;
  }

  return (
    <div className="restaurant-dashboard">
      <div className="dashboard-header">
        <h2>Chào mừng đến với {restaurant?.name}</h2>
        <p>Quản lý nhà hàng của bạn một cách hiệu quả</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Sản phẩm</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-cash"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalRevenue.toLocaleString()} VND</h3>
            <p>Doanh thu</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Đơn chờ xử lý</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h3>Thao tác nhanh</h3>
          <div className="actions-grid">
            <button className="action-card" onClick={() => window.location.href = '/restaurant-owner/products'}>
              <i className="bi bi-plus-circle"></i>
              <span>Thêm sản phẩm</span>
            </button>
            <button className="action-card" onClick={() => window.location.href = '/restaurant-owner/orders'}>
              <i className="bi bi-receipt"></i>
              <span>Xem đơn hàng</span>
            </button>
            <button className="action-card" onClick={() => window.location.href = '/restaurant-owner/settings'}>
              <i className="bi bi-gear"></i>
              <span>Cài đặt</span>
            </button>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list">
            <p className="no-activity">Chưa có hoạt động nào</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;