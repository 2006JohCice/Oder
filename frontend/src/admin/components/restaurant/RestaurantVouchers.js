import React, { useState, useEffect } from "react";
import "../../css/RestaurantDashboard.css";

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
    expirationDate: "",
    description: "",
  });

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/admin/vouchers", { credentials: "include" });
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
        maxDiscountAmount: Number(formData.maxDiscountAmount) || 0
      };

      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Thêm mã giảm giá thành công");
        setShowModal(false);
        setFormData({ code: "", discountType: "amount", discountValue: "", minOrderValue: "", maxDiscountAmount: "", expirationDate: "", description: "" });
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
      const res = await fetch(`/api/admin/vouchers/${id}`, {
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

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-ticket-perforated" style={{ color: "#3498DB", marginRight: 10 }}></i> 
            Mã Giảm Giá
          </h1>
          <p className="adm-page-subtitle">Quản lý và tạo các mã khuyến mãi cho khách hàng</p>
        </div>
        <div>
          <button className="adm-btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg"></i> Tạo Voucher Mới
          </button>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 20 }}>Đang tải...</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mã (Code)</th>
                <th>Giảm giá</th>
                <th>Đơn tối thiểu</th>
                <th>Ngày hết hạn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px 0", color: "#a0aec0" }}>
                    Chưa có mã giảm giá nào
                  </td>
                </tr>
              ) : (
                vouchers.map(v => (
                  <tr key={v._id}>
                    <td><strong style={{ color: '#E53E3E' }}>{v.code}</strong></td>
                    <td>
                      {v.discountType === 'amount' 
                        ? `${v.discountValue.toLocaleString()}đ` 
                        : `${v.discountValue}%`}
                    </td>
                    <td>{v.minOrderValue.toLocaleString()}đ</td>
                    <td>{new Date(v.expirationDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className="adm-btn-icon" onClick={() => handleDelete(v._id)} style={{ color: '#E53E3E' }}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="adm-modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="adm-modal" style={{ background: '#fff', padding: 30, borderRadius: 8, width: 500, maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Tạo Mã Giảm Giá</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Mã Code (VD: TET2024)</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} required className="adm-form-control" />
              </div>
              
              <div style={{ display: 'flex', gap: 15, marginBottom: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Loại giảm</label>
                  <select name="discountType" value={formData.discountType} onChange={handleChange} className="adm-form-control">
                    <option value="amount">Số tiền trực tiếp (VNĐ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Mức giảm</label>
                  <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required className="adm-form-control" placeholder={formData.discountType === 'amount' ? 'VD: 50000' : 'VD: 15'} />
                </div>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Giá trị đơn tối thiểu để áp dụng</label>
                <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} required className="adm-form-control" placeholder="VD: 200000" />
              </div>

              {formData.discountType === 'percent' && (
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Mức giảm tối đa (VNĐ)</label>
                  <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} className="adm-form-control" placeholder="VD: 100000" />
                </div>
              )}

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Ngày hết hạn</label>
                <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} required className="adm-form-control" />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: 5 }}>Mô tả ngắn</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="adm-form-control" placeholder="VD: Dành cho hóa đơn từ 200k" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="adm-btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 15px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" className="adm-btn-primary" style={{ padding: '8px 15px' }}>Tạo mã</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantVouchers;
