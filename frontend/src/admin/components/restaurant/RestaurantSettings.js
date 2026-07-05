import React, { useState, useEffect } from "react";
import "../../css/RestaurantDashboard.css"; // Reuse existing admin styles

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        description: restaurant.description || "",
        locationLabel: restaurant.locationLabel || "",
        openTime: restaurant.openTime || "08:00",
        closeTime: restaurant.closeTime || "22:00",
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

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-gear" style={{ color: "#3498DB", marginRight: 10 }}></i> 
            Cài đặt nhà hàng
          </h1>
          <p className="adm-page-subtitle">Quản lý thông tin hiển thị và giờ mở cửa của nhà hàng</p>
        </div>
      </div>

      <div style={{ maxWidth: 800 }}>
        <form onSubmit={handleUpdateRestaurant}>
          
          <div className="adm-card" style={{ background: '#fff', padding: 30, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a202c', marginBottom: 20, borderBottom: '1px solid #edf2f7', paddingBottom: 10 }}>
              Thông tin cơ bản
            </h3>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Tên nhà hàng</label>
              <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Tên vị trí / khu vực (VD: Chi nhánh 1)</label>
              <input 
                type="text" 
                name="locationLabel"
                value={formData.locationLabel} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Số điện thoại liên hệ</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Địa chỉ cụ thể</label>
              <input 
                type="text" 
                name="address"
                value={formData.address} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Giới thiệu / Ghi chú</label>
              <textarea 
                name="description"
                value={formData.description} 
                onChange={handleChange} 
                rows={4}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* TIME SETTINGS SECTION */}
          <div className="adm-card" style={{ background: '#fff', padding: 30, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a202c', marginBottom: 20, borderBottom: '1px solid #edf2f7', paddingBottom: 10 }}>
              <i className="bi bi-clock-history" style={{color: '#F39C12', marginRight: 8}}></i> 
              Thời gian hoạt động
            </h3>
            
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1, marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Giờ mở cửa</label>
                <input 
                  type="time" 
                  name="openTime"
                  value={formData.openTime} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ flex: 1, marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Giờ đóng cửa</label>
                <input 
                  type="time" 
                  name="closeTime"
                  value={formData.closeTime} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15, marginBottom: 50 }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#3498DB', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: 6, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
            >
              {loading ? (
                <>
                  <i className="bi bi-hourglass-split"></i> Đang lưu...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle"></i> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantSettings;
