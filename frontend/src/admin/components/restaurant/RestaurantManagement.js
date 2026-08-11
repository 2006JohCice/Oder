import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/shared/admin-components.css";

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const query = filterStatus ? `?status=${filterStatus}` : "";
      const res = await fetch(`/api/admin/restaurants${query}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filterStatus]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/restaurants/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchRestaurants();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhà hàng này không?")) return;
    try {
      const res = await fetch(`/api/admin/restaurants/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        fetchRestaurants();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const summary = useMemo(() => ({
    total: restaurants.length,
    active: restaurants.filter((item) => item.status === "active").length,
    pending: restaurants.filter((item) => item.status === "pending").length,
    highRated: restaurants.filter((item) => Number(item.ratingAverage || 0) >= 4).length,
  }), [restaurants]);

  return (
    <div className="adm-page">

      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-shop" style={{ color: "var(--adm-warning)", marginRight: 8 }} />
            Quản lý nhà hàng
          </h1>
          <p className="adm-page-sub">Theo dõi, duyệt và quản lý các cửa hàng/nhà hàng trên hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <section className="adm-stats">
        <div className="adm-stat-card adm-stat-card--blue">
          <div className="adm-stat-icon"><i className="bi bi-shop" /></div>
          <span className="adm-stat-label">Tổng nhà hàng</span>
          <span className="adm-stat-value">{summary.total}</span>
          <span className="adm-stat-sub">trên toàn hệ thống</span>
        </div>
        <div className="adm-stat-card adm-stat-card--green">
          <div className="adm-stat-icon"><i className="bi bi-check-circle" /></div>
          <span className="adm-stat-label">Đang hoạt động</span>
          <span className="adm-stat-value">{summary.active}</span>
          <span className="adm-stat-sub">nhà hàng online</span>
        </div>
        <div className="adm-stat-card adm-stat-card--orange">
          <div className="adm-stat-icon"><i className="bi bi-hourglass-split" /></div>
          <span className="adm-stat-label">Chờ duyệt</span>
          <span className="adm-stat-value">{summary.pending}</span>
          <span className="adm-stat-sub">cần xác nhận mở</span>
        </div>
        <div className="adm-stat-card adm-stat-card--purple">
          <div className="adm-stat-icon"><i className="bi bi-star" /></div>
          <span className="adm-stat-label">Rate cao</span>
          <span className="adm-stat-value">{summary.highRated}</span>
          <span className="adm-stat-sub">đánh giá từ 4.0 trở lên</span>
        </div>
      </section>

      {/* Main Table */}
      <div className="adm-card">
        <div className="adm-toolbar" style={{ border: "none", borderBottom: "1px solid var(--adm-border)", borderRadius: 0, margin: 0 }}>
          <div className="adm-toolbar-left">
            <span style={{ fontWeight: 700, color: "var(--adm-text)" }}>
              <i className="bi bi-list-ul" /> Danh sách đối tác
            </span>
          </div>
          <div className="adm-toolbar-right">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="adm-select">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đình chỉ</option>
            </select>
          </div>
        </div>

        <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nhà hàng</th>
                <th>Chủ tài khoản</th>
                <th className="adm-th-center">Đánh giá</th>
                <th className="adm-th-center">Đơn mua</th>
                <th className="adm-th-center">Trạng thái</th>
                <th className="adm-th-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="adm-loading-row"><td colSpan="6"><div className="adm-spinner" /><div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải...</div></td></tr>
              ) : restaurants.length === 0 ? (
                <tr><td colSpan="6"><div className="adm-empty"><div className="adm-empty-icon"><i className="bi bi-inbox" /></div><div className="adm-empty-text">Không tìm thấy nhà hàng nào</div></div></td></tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--adm-text)" }}>
                        {restaurant.name}
                        {restaurant.appealStatus === "pending" && (
                          <span className="adm-badge adm-badge--orange" style={{ marginLeft: 8, fontSize: 10 }} title={`Kháng cáo: ${restaurant.appealMessage}`}>
                            <i className="bi bi-flag-fill"></i> Có kháng cáo
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--adm-muted)", marginTop: 2 }}><i className="bi bi-geo-alt" /> {restaurant.address}</div>
                      <div style={{ fontSize: 12, color: "var(--adm-muted)" }}><i className="bi bi-telephone" /> {restaurant.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                        <i className="bi bi-person-badge" style={{ color: "var(--adm-info)" }} /> {restaurant.owner_id?.fullname || "N/A"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>{restaurant.owner_id?.email}</div>
                    </td>
                    <td className="adm-td-center">
                      <div style={{ color: "#f39c12", fontWeight: 700, fontSize: 13 }}>
                        <i className="bi bi-star-fill" style={{ fontSize: 11, marginRight: 4 }} />
                        {Number(restaurant.ratingAverage || 0).toFixed(1)} <span style={{ color: "var(--adm-muted)", fontSize: 12 }}>/ 5</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--adm-muted-2)" }}>{restaurant.ratingCount || 0} đánh giá</div>
                    </td>
                    <td className="adm-td-center">
                      <span className="adm-badge adm-badge--grey">{restaurant.orderCount || 0}</span>
                    </td>
                    <td className="adm-td-center">
                      <span className={`adm-badge adm-badge--${restaurant.status === "active" ? "active" : restaurant.status === "pending" ? "pending" : "inactive"}`}>
                        <i className={`bi bi-${restaurant.status === "active" ? "check-circle" : restaurant.status === "pending" ? "hourglass-split" : "slash-circle"}`} />
                        {restaurant.status === "active" ? "Hoạt động" : restaurant.status === "pending" ? "Chờ duyệt" : "Đình chỉ"}
                      </span>
                    </td>
                    <td className="adm-td-center">
                      <div className="adm-actions" style={{ justifyContent: "center" }}>
                        {restaurant.status === "pending" && (
                          <>
                            <button className="adm-btn adm-btn--primary adm-btn--icon" onClick={() => updateStatus(restaurant._id, "active")} title="Duyệt"><i className="bi bi-check-lg" /></button>
                            <button className="adm-btn adm-btn--danger adm-btn--icon" onClick={() => updateStatus(restaurant._id, "inactive")} title="Từ chối"><i className="bi bi-x-lg" /></button>
                          </>
                        )}
                        {restaurant.status === "active" && (
                          <button className="adm-btn adm-btn--danger adm-btn--icon" onClick={() => updateStatus(restaurant._id, "inactive")} title="Đình chỉ"><i className="bi bi-pause-fill" /></button>
                        )}
                        {restaurant.status === "inactive" && (
                          <button className="adm-btn adm-btn--primary adm-btn--icon" onClick={() => updateStatus(restaurant._id, "active")} title="Kích hoạt"><i className="bi bi-play-fill" /></button>
                        )}
                        <Link to={`/restaurant/${restaurant.slug || restaurant._id}/products`} target="_blank" rel="noreferrer" className="adm-btn adm-btn--ghost adm-btn--icon" title="Xem menu">
                          <i className="bi bi-box-arrow-up-right" />
                        </Link>
                        <button className="adm-btn adm-btn--danger adm-btn--icon" onClick={() => deleteRestaurant(restaurant._id)} title="Xóa nhà hàng" style={{ marginLeft: 4 }}>
                          <i className="bi bi-trash-fill" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RestaurantManagement;
