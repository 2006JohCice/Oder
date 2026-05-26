import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";


function RoleEdit() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [permCount, setPermCount] = useState(0);

  useEffect(() => {
    fetch(`/api/admin/role/edit/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name:        data.name        || "",
          description: data.description || "",
        });
        setPermCount(Array.isArray(data.permissions) ? data.permissions.length : 0);
      })
      .catch(() => notifyApp("Không tải được vai trò", "error"))
      .finally(() => setFetching(false));
  }, [id]);

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
      const res = await fetch(`/api/admin/role/edit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyApp(data.message || "Cập nhật vai trò thất bại", "error");
        return;
      }
      notifyApp(data.message || "Cập nhật vai trò thành công", "success");
      navigate("/admin/role");
    } catch {
      notifyApp("Lỗi khi cập nhật vai trò", "error");
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
        <h1 className="rol-page-title">Chỉnh sửa vai trò</h1>
        <p className="rol-page-sub">Cập nhật thông tin và quyền hạn của vai trò</p>
      </div>

      <div className="rol-form-wrap">

        {/* Info card — tổng quan quyền hiện tại */}
        {!fetching && (
          <div className="rol-card" style={{ marginBottom: 14 }}>
            <div className="rol-card-body" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--rol-accent-dim)", color: "var(--rol-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                }}>
                  <i className="bi bi-shield-half" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--rol-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                    Tên hiện tại
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--rol-text)" }}>{formData.name || "—"}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--rol-green-dim)", color: "var(--rol-green)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                }}>
                  <i className="bi bi-key" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--rol-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                    Số quyền đang có
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "var(--rol-mono)", color: "var(--rol-green)" }}>
                    {permCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="rol-form-card">
          <div className="rol-form-header">
            <div className="rol-form-header-icon">
              <i className="bi bi-pencil-square" />
            </div>
            <div>
              <div className="rol-form-header-title">Cập nhật thông tin</div>
              <div className="rol-form-header-sub">Thay đổi sẽ áp dụng ngay khi lưu</div>
            </div>
          </div>

          {fetching ? (
            <div className="rol-spinner" />
          ) : (
            <>
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
                    placeholder="Nhập tên vai trò..."
                    value={formData.name}
                    onChange={handleChange}
                  />
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
                    placeholder="Nhập mô tả..."
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  <span className="rol-form-hint">
                    <i className="bi bi-info-circle" />
                    Không bắt buộc
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
                    ? <><i className="bi bi-hourglass-split" /> Đang lưu...</>
                    : <><i className="bi bi-floppy" /> Lưu thay đổi</>}
                </button>
                <Link to="/admin/role" className="rol-btn rol-btn--ghost">
                  <i className="bi bi-x-lg" /> Huỷ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoleEdit;