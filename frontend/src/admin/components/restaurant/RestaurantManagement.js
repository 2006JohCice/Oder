import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/RestaurantManagement.css";

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
        alert(data.message || "Co loi xay ra");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Loi ket noi may chu");
    }
  };

  const summary = useMemo(() => ({
    total: restaurants.length,
    active: restaurants.filter((item) => item.status === "active").length,
    pending: restaurants.filter((item) => item.status === "pending").length,
    highRated: restaurants.filter((item) => Number(item.ratingAverage || 0) >= 4).length,
  }), [restaurants]);

  if (loading) {
    return <div className="loading">Dang tai danh sach nha hang...</div>;
  }

  return (
    <div className="restaurant-management">
      <section className="admin-grid admin-grid-4">
        <div className="admin-card">
          <h3>Tong nha hang</h3>
          <div className="admin-big">{summary.total}</div>
        </div>
        <div className="admin-card">
          <h3>Dang hoat dong</h3>
          <div className="admin-big">{summary.active}</div>
        </div>
        <div className="admin-card">
          <h3>Cho duyet</h3>
          <div className="admin-big">{summary.pending}</div>
        </div>
        <div className="admin-card">
          <h3>Rate cao</h3>
          <div className="admin-big">{summary.highRated}</div>
        </div>
      </section>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h3>Quan ly nha hang</h3>
            <div className="admin-muted">Sap xep uu tien theo rating va luot mua.</div>
          </div>
          <div className="filter-controls">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select">
              <option value="">Tat ca</option>
              <option value="pending">Cho duyet</option>
              <option value="active">Dang hoat dong</option>
              <option value="inactive">Dinh chi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nha hang</th>
              <th>Chu tai khoan</th>
              <th>Danh gia</th>
              <th>Don mua</th>
              <th>Trang thai</th>
              <th>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant._id}>
                <td>
                  <strong>{restaurant.name}</strong>
                  <div className="admin-muted">{restaurant.address}</div>
                  <div className="admin-muted">{restaurant.phone}</div>
                </td>
                <td>
                  {restaurant.owner_id?.fullname || "N/A"}
                  <br />
                  <small>{restaurant.owner_id?.email}</small>
                </td>
                <td>
                  {Number(restaurant.ratingAverage || 0).toFixed(1)} / 5
                  <div className="admin-muted">{restaurant.ratingCount || 0} danh gia</div>
                </td>
                <td>{restaurant.orderCount || 0}</td>
                <td>
                  <span className={`admin-badge admin-status-${restaurant.status}`}>{restaurant.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    {restaurant.status === "pending" && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(restaurant._id, "active")}>Duyet</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(restaurant._id, "inactive")}>Tu choi</button>
                      </>
                    )}
                    {restaurant.status === "active" && (
                      <button className="btn btn-warning btn-sm" onClick={() => updateStatus(restaurant._id, "inactive")}>Dinh chi</button>
                    )}
                    {restaurant.status === "inactive" && (
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(restaurant._id, "active")}>Kich hoat</button>
                    )}
                    <Link className="btn btn-primary btn-sm" to={`/restaurant/${restaurant._id}/products`} target="_blank" rel="noreferrer">Xem menu</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {restaurants.length === 0 && <div className="no-data">Khong co nha hang nao.</div>}
    </div>
  );
};

export default RestaurantManagement;
