import React, { useState, useEffect } from "react";
import "../css/RestaurantDashboard.css";
import "../css/RestaurantVoucher.css";

const RestaurantVouchers = ({ restaurant }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    discountType: "amount",
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    maxUsage: "",
    expirationDate: "",
    description: "",
  });

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/restaurant/vouchers", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setVouchers(data.vouchers || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
        maxUsage: Number(formData.maxUsage) || 0
      };

      const res = await fetch("/api/restaurant/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setFormData({ code: "", discountType: "amount", discountValue: "", minOrderValue: "", maxDiscountAmount: "", maxUsage: "", expirationDate: "", description: "" });
        fetchVouchers();
      } else {
        alert(data.message || "Lỗi khi thêm mã");
      }
    } catch (error) {
      alert("Lỗi mạng");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    try {
      const res = await fetch(`/api/restaurant/vouchers/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchVouchers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/restaurant/vouchers/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchVouchers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-ticket-perforated" style={{ color: "#E53E3E", marginRight: 10 }}></i> 
            Mã Giảm Giá
          </h1>
          <p className="adm-page-subtitle">Quản lý và tạo các mã khuyến mãi thu hút khách hàng</p>
        </div>
        <div>
          <button className="adm-btn-primary" onClick={() => setShowModal(true)} style={{ background: '#E53E3E', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)' }}>
            <i className="bi bi-plus-lg"></i> Tạo Voucher Mới
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : vouchers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 16, border: '1px dashed #cbd5e0' }}>
          <i className="bi bi-ticket-detailed" style={{ fontSize: 60, color: "#cbd5e0" }}></i>
          <h3 style={{ marginTop: 20, color: "#4a5568", fontWeight: 700 }}>Chưa có mã giảm giá nào</h3>
          <p style={{ color: "#718096" }}>Hãy tạo mã giảm giá đầu tiên để tăng doanh thu cho nhà hàng của bạn.</p>
        </div>
      ) : (
        <div className="rv-grid-layout">
          {vouchers.map(v => {
            const expired = isExpired(v.expirationDate);
            let statusClass = v.status === 'active' && !expired ? 'rv-status-active' : (v.status === 'inactive' ? 'rv-status-inactive' : 'rv-status-expired');
            let statusText = v.status === 'active' && !expired ? 'Đang hoạt động' : (v.status === 'inactive' ? 'Tạm ngưng' : 'Đã hết hạn');

            const usagePercent = v.maxUsage > 0 ? Math.min((v.usedCount / v.maxUsage) * 100, 100) : 0;

            return (
              <div key={v._id} className="rv-voucher-card">
                <div className={`rv-card-left ${v.discountType === 'percent' ? 'percent' : ''} ${v.status === 'inactive' || expired ? 'inactive' : ''}`}>
                  <div className="rv-discount-value">
                    {v.discountType === 'amount' 
                      ? (v.discountValue / 1000) + 'K' 
                      : v.discountValue + '%'}
                  </div>
                  <div className="rv-discount-type">Giảm</div>
                </div>
                
                <div className="rv-card-right">
                  <div className="rv-code-header">
                    <h3 className="rv-voucher-code">{v.code}</h3>
                    <span className={`rv-status-badge ${statusClass}`}>{statusText}</span>
                  </div>

                  <div className="rv-info-row">
                    <i className="bi bi-cart-check"></i> Đơn tối thiểu: <strong>{v.minOrderValue.toLocaleString()}đ</strong>
                  </div>
                  {v.discountType === 'percent' && v.maxDiscountAmount > 0 && (
                    <div className="rv-info-row">
                      <i className="bi bi-graph-down"></i> Giảm tối đa: <strong>{v.maxDiscountAmount.toLocaleString()}đ</strong>
                    </div>
                  )}
                  <div className="rv-info-row">
                    <i className="bi bi-calendar-event"></i> HSD: <strong>{new Date(v.expirationDate).toLocaleDateString('vi-VN')}</strong>
                  </div>

                  <div className="rv-progress-container">
                    <div className="rv-progress-text">
                      <span>Đã dùng: {v.usedCount}</span>
                      <span>{v.maxUsage === 0 ? "Không giới hạn" : `Giới hạn: ${v.maxUsage}`}</span>
                    </div>
                    {v.maxUsage > 0 && (
                      <div className="rv-progress-bar">
                        <div className="rv-progress-fill" style={{ width: `${usagePercent}%`, background: usagePercent >= 100 ? '#e53e3e' : '#3182ce' }}></div>
                      </div>
                    )}
                  </div>

                  <div className="rv-card-actions">
                    <button className="rv-btn-toggle" onClick={() => handleToggleStatus(v._id, v.status)}>
                      {v.status === 'active' ? (
                        <><i className="bi bi-pause-circle"></i> Tạm ngưng</>
                      ) : (
                        <><i className="bi bi-play-circle text-success"></i> Kích hoạt</>
                      )}
                    </button>
                    <button className="rv-btn-delete" onClick={() => handleDelete(v._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="rv-modal-overlay">
          <div className="rv-modal-content">
            <div className="rv-modal-header">
              <h2 className="rv-modal-title">Tạo Mã Giảm Giá</h2>
              <button className="rv-modal-close" onClick={() => setShowModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="rv-form-grid">
                <div className="rv-form-group full">
                  <label className="rv-label">Mã Code (VD: TET2024)</label>
                  <input type="text" className="rv-input" name="code" value={formData.code} onChange={handleChange} required placeholder="Nhập mã code viết hoa..." style={{ textTransform: 'uppercase' }} />
                </div>
                
                <div className="rv-form-group">
                  <label className="rv-label">Loại giảm</label>
                  <select className="rv-input" name="discountType" value={formData.discountType} onChange={handleChange}>
                    <option value="amount">Số tiền trực tiếp (VNĐ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                
                <div className="rv-form-group">
                  <label className="rv-label">Mức giảm</label>
                  <input type="number" className="rv-input" name="discountValue" value={formData.discountValue} onChange={handleChange} required placeholder={formData.discountType === 'amount' ? "VD: 50000" : "VD: 15"} />
                </div>
                
                <div className="rv-form-group">
                  <label className="rv-label">Giá trị đơn tối thiểu (VNĐ)</label>
                  <input type="number" className="rv-input" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} required placeholder="VD: 200000" />
                </div>
                
                <div className="rv-form-group">
                  <label className="rv-label">Giới hạn lượt dùng (0 = vô hạn)</label>
                  <input type="number" className="rv-input" name="maxUsage" value={formData.maxUsage} onChange={handleChange} required placeholder="VD: 100" />
                </div>

                {formData.discountType === 'percent' && (
                  <div className="rv-form-group full">
                    <label className="rv-label">Giảm tối đa (VNĐ)</label>
                    <input type="number" className="rv-input" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} placeholder="VD: 30000" />
                  </div>
                )}
                
                <div className="rv-form-group full">
                  <label className="rv-label">Ngày hết hạn</label>
                  <input type="date" className="rv-input" name="expirationDate" value={formData.expirationDate} onChange={handleChange} required />
                </div>
                
                <div className="rv-form-group full">
                  <label className="rv-label">Mô tả ngắn</label>
                  <input type="text" className="rv-input" name="description" value={formData.description} onChange={handleChange} placeholder="VD: Dành cho hóa đơn từ 200k" />
                </div>
              </div>
              
              <div className="rv-modal-footer">
                <button type="button" className="rv-btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="rv-btn-submit">Tạo mã</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantVouchers;
