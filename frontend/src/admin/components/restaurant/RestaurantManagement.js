import { useEffect, useState } from "react";
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
      const res = await fetch(`/api/admin/restaurants${query}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/restaurants/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Cập nhật trạng thái thành công");
        fetchRestaurants();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Lỗi kết nối máy chủ");
    }
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Đang hoạt động";
    if (status === "inactive") return "Đình chỉ";
    if (status === "pending") return "Chờ duyệt";
    return status;
  };

  if (loading) {
    return <div className="loading">Đang tải danh sách nhà hàng...</div>;
  }

  return (
    <div className="restaurant-management">
      <div className="admin-header">
        <h2>Quản lý nhà hàng</h2>
        <div className="filter-controls">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select">
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đình chỉ</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên nhà hàng</th>
              <th>Địa chỉ</th>
              <th>Điện thoại</th>
              <th>Chủ tài khoản</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant._id}>
                <td>{restaurant.name}</td>
                <td>{restaurant.address}</td>
                <td>{restaurant.phone}</td>
                <td>
                  {restaurant.owner_id?.fullname || "N/A"}
                  <br />
                  <small>{restaurant.owner_id?.email}</small>
                </td>
                <td>{getStatusLabel(restaurant.status)}</td>
                <td>
                  <div className="action-buttons">
                    {restaurant.status === "pending" && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(restaurant._id, "active")}>Duyệt</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(restaurant._id, "inactive")}>Từ chối</button>
                      </>
                    )}
                    {restaurant.status === "active" && (
                      <button className="btn btn-warning btn-sm" onClick={() => updateStatus(restaurant._id, "inactive")}>Đình chỉ</button>
                    )}
                    {restaurant.status === "inactive" && (
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(restaurant._id, "active")}>Kích hoạt</button>
                    )}
                    <Link className="btn btn-primary btn-sm" to={`/restaurant/${restaurant._id}/products`} target="_blank" rel="noreferrer">Xem menu</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {restaurants.length === 0 && <div className="no-data">Không có nhà hàng nào.</div>}
    </div>
  );
};

export default RestaurantManagement;
