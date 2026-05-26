import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";


function RoleCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitFormData = async () => {
    if (!formData.name.trim()) {
      notifyApp("Tên vai trò không được để trống", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/role/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyApp(data.message || "Tạo vai trò thất bại", "error");
        return;
      }
      notifyApp(data.message || "Tạo vai trò thành công", "success");
      navigate("/admin/role");
    } catch {
      notifyApp("Lỗi khi tạo vai trò", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rol-form-page">
      {/* Back */}
      <div>
        <Link to="/admin/role" className="rol-back">
          <i className="bi bi-arrow-left" /> Quay lại danh sách
        </Link>
      </div>

      {/* Page title */}
      <div>
        <h1 className="rol-page-title">Thêm vai trò mới</h1>
        <p className="rol-page-sub">Tạo nhóm quyền mới cho hệ thống quản trị</p>
      </div>

      {/* Form card */}
      <div className="rol-form-wrap">
        <div className="rol-form-card">
          <div className="rol-form-header">
            <div className="rol-form-header-icon">
              <i className="bi bi-shield-plus" />
            </div>
            <div>
              <div className="rol-form-header-title">Thông tin vai trò</div>
              <div className="rol-form-header-sub">Điền đầy đủ thông tin bên dưới</div>
            </div>
          </div>

          <div className="rol-form-body">
            {/* Tên vai trò */}
            <div className="rol-form-group">
              <label className="rol-form-label">
                <i className="bi bi-shield-half" />
                Tên vai trò <span className="rol-form-required">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="rol-form-input"
                placeholder="VD: Quản trị viên, Nhân viên kho..."
                value={formData.name}
                onChange={handleChange}
              />
              <span className="rol-form-hint">
                <i className="bi bi-info-circle" />
                Tên vai trò sẽ hiển thị trong danh sách và được gán cho tài khoản
              </span>
            </div>

            {/* Mô tả */}
            <div className="rol-form-group">
              <label className="rol-form-label">
                <i className="bi bi-card-text" />
                Mô tả
              </label>
              <textarea
                name="description"
                className="rol-form-textarea"
                placeholder="Mô tả ngắn về vai trò và phạm vi quyền hạn..."
                rows="4"
                value={formData.description}
                onChange={handleChange}
              />
              <span className="rol-form-hint">
                <i className="bi bi-info-circle" />
                Không bắt buộc — giúp phân biệt vai trò dễ hơn
              </span>
            </div>
          </div>

          <div className="rol-form-footer">
            <button
              type="button"
              className="rol-btn rol-btn--save"
              onClick={submitFormData}
              disabled={loading}
            >
              {loading
                ? <><i className="bi bi-hourglass-split" /> Đang tạo...</>
                : <><i className="bi bi-plus-circle" /> Tạo vai trò</>}
            </button>
            <Link to="/admin/role" className="rol-btn rol-btn--ghost">
              <i className="bi bi-x-lg" /> Huỷ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleCreate;