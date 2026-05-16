import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { formatCurrency, formatDateTime } from "../../users/utils/shop";

function MainAdmin({ query }) {
  const navigate = useNavigate();
  const [overview, setOverview] = useState({
    orders: [],
    users: [],
    restaurants: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes, restaurantsRes] = await Promise.all([
          apiFetch("/api/admin/checkout/doneOrder?limit=200"),
          apiFetch("/api/user"),
          apiFetch("/api/admin/restaurants"),
        ]);

        if (ignore) return;

        setOverview({
          orders: Array.isArray(ordersRes.orders) ? ordersRes.orders : [],
          users: Array.isArray(usersRes.users) ? usersRes.users : [],
          restaurants: Array.isArray(restaurantsRes.restaurants) ? restaurantsRes.restaurants : [],
        });
      } catch (error) {
        if (error.status === 401) {
          navigate("/admin/auth/login");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [navigate]);

  const filteredOrders = useMemo(() => {
    const keyword = String(query || "").trim().toLowerCase();
    if (!keyword) return overview.orders;
    return overview.orders.filter((order) =>
      [
        order.orderId,
        order.orderGroupCode,
        order.userInfo?.fullName,
        order.userInfo?.phone,
        order.restaurantInfo?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [overview.orders, query]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    return {
      totalUsers: overview.users.length,
      totalRestaurants: overview.restaurants.length,
      activeRestaurants: overview.restaurants.filter((item) => item.status === "active").length,
      pendingRestaurants: overview.restaurants.filter((item) => item.status === "pending").length,
      totalOrders: filteredOrders.length,
      pendingOrders: filteredOrders.filter((item) => item.orderStatus === "pending").length,
      totalRevenue,
      tableDeposits: filteredOrders.reduce((sum, item) => sum + Number(item.depositAmount || 0), 0),
    };
  }, [filteredOrders, overview.restaurants, overview.users.length]);

  const topRestaurants = useMemo(() => {
    return [...overview.restaurants]
      .sort((a, b) => {
        if ((b.ratingAverage || 0) !== (a.ratingAverage || 0)) {
          return (b.ratingAverage || 0) - (a.ratingAverage || 0);
        }
        return (b.orderCount || 0) - (a.orderCount || 0);
      })
      .slice(0, 5);
  }, [overview.restaurants]);

  const recentOrders = filteredOrders.slice(0, 6);

  if (loading) {
    return <div className="loading">Dang tai tong quan he thong...</div>;
  }

  return (
    <>
      <section className="admin-hero-grid">
        <article className="admin-hero-card">
          <span className="admin-hero-label">Doanh thu</span>
          <strong>{formatCurrency(stats.totalRevenue)}</strong>
          <p>{stats.totalOrders} don hang, {stats.pendingOrders} don dang cho xu ly.</p>
        </article>
        <article className="admin-hero-card">
          <span className="admin-hero-label">He thong nha hang</span>
          <strong>{stats.totalRestaurants}</strong>
          <p>{stats.activeRestaurants} dang hoat dong, {stats.pendingRestaurants} cho duyet.</p>
        </article>
        <article className="admin-hero-card">
          <span className="admin-hero-label">Nguoi dung</span>
          <strong>{stats.totalUsers}</strong>
          <p>Luong dat ban demo coc: {formatCurrency(stats.tableDeposits)}.</p>
        </article>
      </section>

      <section className="admin-grid admin-grid-4">
        <div className="admin-card">
          <h3>Tong don</h3>
          <div className="admin-big">{stats.totalOrders}</div>
          <div className="admin-trend">Bao gom giao hang va dat ban.</div>
        </div>
        <div className="admin-card">
          <h3>Don dang cho</h3>
          <div className="admin-big">{stats.pendingOrders}</div>
          <div className="admin-trend">Can uu tien xac nhan va dieu phoi.</div>
        </div>
        <div className="admin-card">
          <h3>Nha hang active</h3>
          <div className="admin-big">{stats.activeRestaurants}</div>
          <div className="admin-trend">Dang nhan don tren he thong.</div>
        </div>
        <div className="admin-card">
          <h3>Cho duyet</h3>
          <div className="admin-big">{stats.pendingRestaurants}</div>
          <div className="admin-trend">Can xu ly ho so dang ky moi.</div>
        </div>
      </section>

      <section className="admin-content">
        <div className="admin-card admin-table">
          <div className="admin-section-head">
            <div>
              <h3>Don gan day</h3>
              <div className="admin-muted">Theo doi nha hang, kieu don, coc va thong tin ban.</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ma don</th>
                <th>Nha hang</th>
                <th>Khach</th>
                <th>Loai</th>
                <th>Tong</th>
                <th>Coc</th>
                <th>Trang thai</th>
                <th>Ngay tao</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>{order.orderId}</strong>
                    <div className="admin-muted">{order.orderGroupCode || "Don le"}</div>
                  </td>
                  <td>{order.restaurantInfo?.name || "Nha hang"}</td>
                  <td>
                    <strong>{order.userInfo?.fullName || "Khach le"}</strong>
                    <div className="admin-muted">{order.userInfo?.phone || "--"}</div>
                  </td>
                  <td>{order.orderType === "delivery" ? "Giao hang" : "Dat ban"}</td>
                  <td>{formatCurrency(order.totalAmount || 0)}</td>
                  <td>{formatCurrency(order.depositAmount || 0)}</td>
                  <td>
                    <span className={`admin-badge admin-status-${order.orderStatus}`}>{order.orderStatus}</span>
                  </td>
                  <td>{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="admin-panel">
          <div className="admin-card">
            <h3>Nha hang noi bat</h3>
            <div className="admin-feed">
              {topRestaurants.map((restaurant) => (
                <div className="admin-feed-item" key={restaurant._id}>
                  <strong>{restaurant.name}</strong>
                  <div className="admin-muted">
                    {Number(restaurant.ratingAverage || 0).toFixed(1)} sao, {restaurant.orderCount || 0} luot mua
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h3>Goi y van hanh</h3>
            <div className="admin-feed">
              <div className="admin-feed-item">Uu tien duyet nha hang pending de mo rong nguon mon.</div>
              <div className="admin-feed-item">Don dat ban can doi soat coc 200k truoc khi xac nhan.</div>
              <div className="admin-feed-item">Theo doi nhung nha hang rate cao de day len trang chu user.</div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

export default MainAdmin;
