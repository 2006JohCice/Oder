import { useState, useEffect } from "react";

const RestaurantSettings = ({ restaurant }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    locationLabel: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        description: restaurant.description || "",
        locationLabel: restaurant.locationLabel || "",
      });
    }
  }, [restaurant]);

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/my", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      alert(data.message || "Đã cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-settings">
      <div className="page-header"><h2>Cài đặt nhà hàng</h2></div>
      <div className="settings-container">
        <form onSubmit={handleUpdateRestaurant}>
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-group"><label>Tên nhà hàng</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Tên vị trí / địa điểm</label><input type="text" value={formData.locationLabel} onChange={(e) => setFormData({ ...formData, locationLabel: e.target.value })} required /></div>
            <div className="form-group"><label>Địa chỉ</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required /></div>
            <div className="form-group"><label>Số điện thoại</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
            <div className="form-group"><label>Ghi chú</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantSettings;
