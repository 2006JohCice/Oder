import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import "../../css/shared/admin-components.css";

function SettingsAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullname: "", email: "", phone: "", oldPassword: "", newPassword: "", confirmPassword: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const apiSetting = () => {
    setLoading(true);
    fetch("/api/admin/setting/profile", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) {
          setForm((prev) => ({
            ...prev,
            fullname: res.data.fullname || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
          }));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { apiSetting(); }, []);

  const handleSubmitEdit = async () => {
    try {
      const res = await fetch("/api/admin/setting/profile/edit", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { notifyApp(data.message || "Cập nhật thất bại", "error"); return; }
      notifyApp(data.message || "Cập nhật thành công", "success");
      setForm(prev => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
      apiSetting();
    } catch { notifyApp("Lỗi hệ thống", "error"); }
  };

  const handleClickLogOut = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
    try {
      const res = await fetch("/api/admin/auth/logout", { method: "GET", credentials: "include" });
      if (res.ok) navigate("/admin/auth/login");
    } catch { notifyApp("Lỗi đăng xuất", "error"); }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-gear-fill" style={{ color: "var(--adm-muted-2)", marginRight: 8 }} />
            Cài đặt hệ thống
          </h1>
          <p className="adm-page-sub">Cập nhật hồ sơ cá nhân và cấu hình bảo mật tài khoản admin</p>
        </div>
        <button className="adm-btn adm-btn--danger" onClick={handleClickLogOut}>
          <i className="bi bi-box-arrow-right" /> Đăng xuất
        </button>
      </div>

      <div className="adm-card" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="adm-card-header" style={{ padding: 0 }}>
          <div className="adm-tabs" style={{ background: "transparent", border: "none", margin: "14px 18px", gap: 8 }}>
            <button className={`adm-tab ${activeTab === "profile" ? "adm-tab--active" : ""}`} onClick={() => setActiveTab("profile")}>
              <i className="bi bi-person-lines-fill" /> Hồ sơ cá nhân
            </button>
            <button className={`adm-tab ${activeTab === "security" ? "adm-tab--active" : ""}`} onClick={() => setActiveTab("security")}>
              <i className="bi bi-shield-lock-fill" /> Bảo mật & Mật khẩu
            </button>
          </div>
        </div>

        <div className="adm-card-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--adm-muted)" }}>
              <div className="adm-spinner" /> Đang tải dữ liệu...
            </div>
          ) : activeTab === "profile" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-person" /> Họ và tên</label>
                <input type="text" name="fullname" value={form.fullname} onChange={handleChange} className="adm-form-input" placeholder="Nhập họ và tên..." />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-envelope" /> Email (Không thể đổi)</label>
                <input type="email" name="email" value={form.email} className="adm-form-input" disabled style={{ background: "var(--adm-bg)", cursor: "not-allowed" }} />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-telephone" /> Số điện thoại</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} className="adm-form-input" placeholder="Nhập số điện thoại..." />
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="button" className="adm-btn adm-btn--save" onClick={handleSubmitEdit}>
                  <i className="bi bi-floppy" /> Lưu thay đổi hồ sơ
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="adm-notification" style={{ background: "var(--adm-warning-dim)", color: "#c87f0a", borderColor: "var(--adm-warning)" }}>
                <i className="bi bi-exclamation-triangle" /> Lưu ý: Để trống các ô này nếu không muốn đổi mật khẩu.
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-key" /> Mật khẩu hiện tại</label>
                <input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} className="adm-form-input" placeholder="Nhập mật khẩu hiện tại..." />
              </div>
              <div className="adm-grid-2" style={{ marginBottom: 0 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label"><i className="bi bi-lock" /> Mật khẩu mới</label>
                  <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className="adm-form-input" placeholder="Nhập mật khẩu mới..." />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label"><i className="bi bi-check2-all" /> Xác nhận mật khẩu mới</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="adm-form-input" placeholder="Nhập lại mật khẩu mới..." />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="button" className="adm-btn adm-btn--primary" onClick={handleSubmitEdit} disabled={!form.oldPassword || !form.newPassword || !form.confirmPassword}>
                  <i className="bi bi-shield-check" /> Cập nhật mật khẩu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsAdmin;
