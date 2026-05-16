import "../../css/setting/setting.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function SettingsAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const apiSetting = () => {
    fetch("/api/admin/setting/profile", {
      method: "GET",
      credentials: "include",
    })
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
      });
  };

  useEffect(() => {
    apiSetting();
  }, []);

  const handleSubmitEdit = async () => {
    const res = await fetch("/api/admin/setting/profile/edit", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      notifyApp(data.message || "Cập nhật thất bại", "error");
      return;
    }
    notifyApp(data.message || "Cập nhật thành công", "success");
    apiSetting();
  };

  const handleClickLogOut = async () => {
    try {
      const res = await fetch("/api/admin/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        navigate("/admin/auth/login");
      }
    } catch (error) {
      notifyApp("Lỗi đăng xuất", "error");
    }
  };

  return (
    <section>
      <div className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h3>Cài đặt quản trị</h3>
            <div className="admin-muted">Cập nhật hồ sơ admin và cấu hình bảo mật cơ bản.</div>
          </div>
          <div className="admin-btn-group">
            {["profile", "security"].map((tab) => (
              <button
                key={tab}
                className={`admin-btn ${activeTab === tab ? "admin-primary" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "profile" ? "Hồ sơ" : "Bảo mật"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="admin-content" style={{ gridTemplateColumns: "2fr 1fr", marginTop: "20px" }}>
        <div className="admin-card">
          <div className="admin-editor" style={{ display: "grid", gap: "12px" }}>
            <div>
              <label>Họ và tên</label>
              <input type="text" name="fullname" value={form.fullname} onChange={handleChange} className="admin-input" />
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="admin-input" />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="admin-input" />
            </div>
            <div className="admin-form-row">
              <button type="button" className="admin-btn admin-primary" onClick={handleSubmitEdit}>
                Lưu hồ sơ
              </button>
              <button type="button" className="admin-btn" onClick={handleClickLogOut}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {activeTab === "security" && (
          <div className="admin-card">
            <div className="admin-editor" style={{ display: "grid", gap: "12px" }}>
              <div>
                <label>Mật khẩu cũ</label>
                <input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} className="admin-input" />
              </div>
              <div>
                <label>Mật khẩu mới</label>
                <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className="admin-input" />
              </div>
              <div>
                <label>Xác nhận mật khẩu</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="admin-input" />
              </div>
              <button type="button" className="admin-btn admin-primary" onClick={handleSubmitEdit}>
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

export default SettingsAdmin;
