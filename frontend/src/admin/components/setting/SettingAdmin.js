/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import "../../css/setting/setting.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SettingsAdmin() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(true);

  // GÃ¡Â»ËœP HÃ¡ÂºÂ¾T PASSWORD VÃƒâ‚¬O FORM
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
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) {
          setForm((prev) => ({
            ...prev,
            fullname: res.data.fullname,
            email: res.data.email,
            phone: res.data.phone,
          }));
        }
      });
  };

  useEffect(() => {
    apiSetting();
  }, []);

  // FIX LOGIC SUBMIT
  const handleSubmitEdit = () => {
    if (form.newPassword !== form.confirmPassword) {
      setConfirmPassword(false);
      return;
    }

    setConfirmPassword(true);

    fetch("/api/admin/setting/profile/edit", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃƒÂ nh cÃƒÂ´ng!");
        } else {
          alert(res.message || "CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i!");
        }
      });
  };

  const handleClickLogOut = async () => {
    const isConfirm = window.confirm("BÃ¡ÂºÂ¡n cÃƒÂ³ muÃ¡Â»â€˜n Ã„â€˜Ã„Æ’ng xuÃ¡ÂºÂ¥t chÃ¡Â»Â©?");
    if (!isConfirm) return;

    try {
      const res = await fetch("/api/admin/auth/logout", {
        method: "GET",
      });

      if (res.ok) {
        navigate("/admin/auth/login");
      }
    } catch (error) {
      console.log("LÃ¡Â»â€”i server");
    }
  };

  return (
    <section>
      <h2>Ã¢Å¡â„¢Ã¯Â¸Â Settings Panel</h2>

      {/* Tabs */}
      <div className="admin-btn-group">
        {["profile", "security", "system", "appearance"].map((tab) => (
          <button
            key={tab}
            className={`admin-btn ${
              activeTab === tab ? "admin-primary" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "profile"
              ? "Profile"
              : tab === "security"
              ? "Security"
              : tab === "system"
              ? "System"
              : "Appearance"}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {activeTab === "profile" && (
        <section
          className="admin-content"
          style={{ gridTemplateColumns: "2fr 1fr", marginTop: "20px" }}
        >
          <form style={{ display: "contents" }}>
            {/* LEFT */}
            <div>
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={form.fullname}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>

              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="admin-btn admin-primary"
                  onClick={handleSubmitEdit}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleClickLogOut}
                >
                  Log Out
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <div>
                <label>Old Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={form.oldPassword}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="admin-input"
                  required
                  style={{ borderColor: confirmPassword ? "" : "red" }}
                />
                {!confirmPassword && (
                  <span style={{ color: "red" }}>
                    MÃ¡ÂºÂ­t khÃ¡ÂºÂ©u khÃƒÂ´ng khÃ¡Â»â€ºp!
                  </span>
                )}
              </div>

              <a href="#" className="text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        </section>
      )}

      {/* SYSTEM */}
      {activeTab === "system" && (
        <div>
          <div style={{ display: "flex", gap: "20px" }}>
            <label>System Language</label>
            <select className="admin-select">
              <option>Ã°Å¸â€¡Â»Ã°Å¸â€¡Â³ Vietnamese</option>
              <option>Ã°Å¸â€¡Â¬Ã°Å¸â€¡Â§ English</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            <label>Time Zone</label>
            <select className="admin-select">
              <option>Asia/Ho_Chi_Minh (GMT+7)</option>
            </select>
          </div>
        </div>
      )}

      {/* APPEARANCE */}
      {activeTab === "appearance" && (
        <div>
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default SettingsAdmin;
