import React, { useState, useEffect } from "react";
import "../css/RestaurantDashboard.css"; 
import "../css/RestaurantSettings.css";

const RestaurantSettings = ({ restaurant }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    locationLabel: "",
    openTime: "08:00",
    closeTime: "22:00",
  });
  const [isAllDay, setIsAllDay] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      const oTime = restaurant.openTime || "08:00";
      const cTime = restaurant.closeTime || "22:00";
      
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        description: restaurant.description || "",
        locationLabel: restaurant.locationLabel || "",
        openTime: oTime,
        closeTime: cTime,
      });

      if (oTime === "00:00" && cTime === "23:59") {
        setIsAllDay(true);
      }
    }
  }, [restaurant]);

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (isAllDay) {
        payload.openTime = "00:00";
        payload.closeTime = "23:59";
      }

      const res = await fetch("/api/restaurant/my", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(data.message || "Lưu cài đặt thành công!");
    } catch (error) {
      alert("Đã xảy ra lỗi khi lưu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAllDay = () => {
    const nextState = !isAllDay;
    setIsAllDay(nextState);
    if (nextState) {
      setFormData(prev => ({ ...prev, openTime: "00:00", closeTime: "23:59" }));
    } else {
      // Revert to some default if untoggled, or just let them edit
      setFormData(prev => ({ ...prev, openTime: "08:00", closeTime: "22:00" }));
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-gear" style={{ color: "#3182ce", marginRight: 10 }}></i> 
            Cài đặt nhà hàng
          </h1>
          <p className="adm-page-subtitle">Cập nhật thông tin nhận diện và thời gian hoạt động để khách hàng dễ dàng tìm kiếm</p>
        </div>
      </div>

      <div className="rs-form-container">
        <form onSubmit={handleUpdateRestaurant}>
          
          <div className="rs-card">
            <div className="rs-card-header">
              <div className="rs-card-icon"><i className="bi bi-shop-window"></i></div>
              <h3 className="rs-card-title">Thông tin cơ bản</h3>
            </div>
            
            <div className="rs-grid-2">
              <div className="rs-form-group">
                <label className="rs-label">Tên nhà hàng</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="rs-input"
                  placeholder="VD: Bistro Gourmet"
                />
              </div>
              
              <div className="rs-form-group">
                <label className="rs-label">Khu vực / Chi nhánh (tùy chọn)</label>
                <input 
                  type="text" 
                  name="locationLabel"
                  value={formData.locationLabel} 
                  onChange={handleChange} 
                  className="rs-input"
                  placeholder="VD: Chi nhánh Quận 1"
                />
              </div>
            </div>

            <div className="rs-grid-2">
              <div className="rs-form-group">
                <label className="rs-label">Số điện thoại liên hệ</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  className="rs-input"
                  placeholder="VD: 0901234567"
                />
              </div>
              
              <div className="rs-form-group">
                <label className="rs-label">Địa chỉ cụ thể</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                  className="rs-input"
                  placeholder="Số nhà, đường, phường/xã..."
                />
              </div>
            </div>

            <div className="rs-form-group">
              <label className="rs-label">Giới thiệu / Ghi chú</label>
              <textarea 
                name="description"
                value={formData.description} 
                onChange={handleChange} 
                rows={3}
                className="rs-textarea"
                placeholder="Vài nét nổi bật về không gian, món ăn đặc trưng của nhà hàng..."
              />
            </div>
          </div>

          <div className="rs-card">
            <div className="rs-card-header">
              <div className="rs-card-icon time"><i className="bi bi-clock-history"></i></div>
              <h3 className="rs-card-title">Thời gian hoạt động</h3>
            </div>
            
            <div 
              className={`rs-checkbox-wrapper ${isAllDay ? 'active' : ''}`} 
              onClick={toggleAllDay}
            >
              <input 
                type="checkbox" 
                className="rs-checkbox" 
                checked={isAllDay} 
                onChange={toggleAllDay} 
                onClick={(e) => e.stopPropagation()}
              />
              <span className="rs-checkbox-label">Hoạt động cả ngày (24/7)</span>
            </div>

            <div className="rs-grid-2">
              <div className="rs-form-group">
                <label className="rs-label">Giờ mở cửa</label>
                <input 
                  type="time" 
                  name="openTime"
                  value={formData.openTime} 
                  onChange={handleChange} 
                  required 
                  className="rs-input"
                  disabled={isAllDay}
                />
              </div>

              <div className="rs-form-group">
                <label className="rs-label">Giờ đóng cửa</label>
                <input 
                  type="time" 
                  name="closeTime"
                  value={formData.closeTime} 
                  onChange={handleChange} 
                  required 
                  className="rs-input"
                  disabled={isAllDay}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15, marginBottom: 50 }}>
            <button 
              type="submit" 
              disabled={loading}
              className="rs-btn-save"
            >
              {loading ? (
                <><i className="bi bi-hourglass-split"></i> Đang lưu...</>
              ) : (
                <><i className="bi bi-check2-circle"></i> Lưu thay đổi</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantSettings;
