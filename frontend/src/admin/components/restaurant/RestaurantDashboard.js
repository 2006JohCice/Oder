import { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "../../../users/utils/shop";
import "../../css/RestaurantDashboard.css";

const RestaurantDashboard = ({ restaurant }) => {
  const [dashboard, setDashboard] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      ratingAverage: 0,
      ratingCount: 0,
      orderCount: 0,
    },
    recentOrders: [],
    recentFeedbacks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/restaurant/dashboard", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setDashboard(data);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [restaurant]);

  if (loading) {
    return <div className="loading">Dang tai thong ke...</div>;
  }

  const { stats, recentOrders, recentFeedbacks } = dashboard;

  return (
    <div className="restaurant-dashboard">
      <div className="dashboard-header">
        <h2>{restaurant?.name}</h2>
        <p>Theo doi doanh thu, dat ban, giao hang va chat luong phan hoi tren cung mot bang dieu khien.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>San pham dang ban</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Tong don hang</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Doanh thu</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{Number(stats.ratingAverage || 0).toFixed(1)} / 5</h3>
            <p>{stats.ratingCount || 0} danh gia</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h3>Don gan day</h3>
          <div className="activity-list">
            {recentOrders.length === 0 ? (
              <p className="no-activity">Chua co don hang nao</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="activity-item">
                  <strong>{order.orderId}</strong>
                  <span>{order.orderType === "delivery" ? "Giao hang" : "Dat ban"} - {order.userInfo?.fullName || "Khach"}</span>
                  <span>{formatCurrency(order.totalAmount || 0)} - {order.orderStatus}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="recent-activity">
          <h3>Phan hoi moi</h3>
          <div className="activity-list">
            {recentFeedbacks.length === 0 ? (
              <p className="no-activity">Chua co phan hoi nao</p>
            ) : (
              recentFeedbacks.map((item) => (
                <div key={item._id} className="activity-item">
                  <strong>{item.fullname || "Khach hang"}</strong>
                  <span>{item.sentiment === "good" ? "Danh gia tot" : "Can cai thien"} - {item.rating}/5</span>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
