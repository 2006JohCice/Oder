import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import "../MainAdmin.css";
import { prefixAdmin } from "../../../config/system";

export default function PlatformVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: 0,
    maxDiscountAmount: 0,
    maxUsage: 0,
    expirationDate: "",
    description: "",
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await apiFetch("/api/admin/platform-vouchers");
      setVouchers(res.vouchers || []);
    } catch (err) {
      alert("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscountAmount: Number(formData.maxDiscountAmount),
        maxUsage: Number(formData.maxUsage)
      };

      const res = await apiFetch("/api/admin/platform-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      alert(res.message);
      setShowModal(false);
      setFormData({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderValue: 0,
        maxDiscountAmount: 0,
        maxUsage: 0,
        expirationDate: "",
        description: "",
      });
      fetchVouchers();
    } catch (err) {
      alert("Tạo mã thất bại. Có thể mã đã tồn tại.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã này?")) return;
    try {
      await apiFetch(`/api/admin/platform-vouchers/${id}`, { method: "DELETE" });
      alert("Xóa thành công");
      fetchVouchers();
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="main-admin-content">
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quản lý Mã Ưu Đãi (Sàn)</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="bi bi-plus-circle"></i> Thêm Mã Mới
        </button>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Mã Code</th>
              <th>Loại/Mức giảm</th>
              <th>Tối đa giảm</th>
              <th>Đơn tối thiểu</th>
              <th>Lượt dùng</th>
              <th>Hạn sử dụng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-muted">Chưa có mã giảm giá sàn nào</td></tr>
            ) : (
              vouchers.map(v => (
                <tr key={v._id}>
                  <td><span className="badge bg-success px-3 py-2 fs-6">{v.code}</span></td>
                  <td>{v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}</td>
                  <td>{v.maxDiscountAmount > 0 ? `${v.maxDiscountAmount.toLocaleString()}đ` : 'Không giới hạn'}</td>
                  <td>{v.minOrderValue.toLocaleString()}đ</td>
                  <td>{v.usedCount} / {v.maxUsage === 0 ? '∞' : v.maxUsage}</td>
                  <td>{new Date(v.expirationDate).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => handleDelete(v._id)}
                      title="Xóa mã"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo Mã Giảm Giá Sàn</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Mã Code (Tự viết hoa)</label>
                    <input type="text" className="form-control" name="code" value={formData.code} onChange={handleChange} required placeholder="VD: SIEUSALE20" />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label">Loại giảm</label>
                      <select className="form-select" name="discountType" value={formData.discountType} onChange={handleChange}>
                        <option value="percent">Phần trăm (%)</option>
                        <option value="amount">Số tiền (VNĐ)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Mức giảm</label>
                      <input type="number" className="form-control" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="1" placeholder={formData.discountType === 'percent' ? "VD: 10" : "VD: 50000"} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giảm tối đa (Nếu theo %)</label>
                    <input type="number" className="form-control" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} min="0" placeholder="0 = không giới hạn" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Đơn tối thiểu</label>
                    <input type="number" className="form-control" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} min="0" />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label">Số lượt dùng (0 = ∞)</label>
                      <input type="number" className="form-control" name="maxUsage" value={formData.maxUsage} onChange={handleChange} min="0" />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Ngày hết hạn</label>
                      <input type="date" className="form-control" name="expirationDate" value={formData.expirationDate} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả (không bắt buộc)</label>
                    <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="2"></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Tạo Mã</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
