import { useState, useEffect } from "react";
import "../../css/RestaurantManagement.css";

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, [filterStatus]);

  const fetchRestaurants = async () => {
    try {
      const query = filterStatus ? `?status=${filterStatus}` : "";
      const res = await fetch(`/api/admin/restaurants${query}`);
      const data = await res.json();
      if (res.ok) {
        setRestaurants(data.restaurants);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/restaurants/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchRestaurants(); // Refresh list
        alert("Cập nhật trạng thái thành công!");
      } else {
        alert("Có lỗi xảy ra khi cập nhật");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Lỗi kết nối server");
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "inactive":
        return "Đình chỉ";
      case "pending":
        return "Chờ xét duyệt";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-success";
      case "inactive":
        return "text-danger";
      case "pending":
        return "text-warning";
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="loading">Đang tải danh sách nhà hàng...</div>;
  }

  return (
    <div className="restaurant-management">
      <div className="admin-header">
        <h2>Quản Lý Nhà Hàng</h2>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ xét duyệt</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đình chỉ</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên Nhà Hàng</th>
              <th>Địa Chỉ</th>
              <th>Số Điện Thoại</th>
              <th>Chủ Sở Hữu</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Thao Tác</th>
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
                <td>
                  <span className={getStatusColor(restaurant.status)}>
                    {getStatusLabel(restaurant.status)}
                  </span>
                </td>
                <td>{new Date(restaurant.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <div className="action-buttons">
                    {restaurant.status === "pending" && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(restaurant._id, "active")}
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(restaurant._id, "inactive")}
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {restaurant.status === "active" && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => updateStatus(restaurant._id, "inactive")}
                      >
                        Đình chỉ
                      </button>
                    )}
                    {restaurant.status === "inactive" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(restaurant._id, "active")}
                      >
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {restaurants.length === 0 && (
        <div className="no-data">
          <p>Không có nhà hàng nào{filterStatus ? ` với trạng thái ${getStatusLabel(filterStatus)}` : ""}.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;