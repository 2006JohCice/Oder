import React, { useState, useEffect } from "react";
import "../../css/AuthUser.css";
import { apiFetch } from "../../../utils/apiFetch";

const NewsletterRegisterModal = ({ email, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Send OTP automatically when modal opens
    sendOtp();
  }, []);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const sendOtp = async () => {
    setIsSending(true);
    setError("");
    setSuccessMsg("");
    try {
      const fullName = email.split("@")[0];
      // Send dummy password just to pass validation of passwordRegisterOtp API
      const res = await fetch(`/api/user/register/passwordOtp`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password: "TempPassword!123",
          confirmPassword: "TempPassword!123",
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTimeLeft(300);
        setSuccessMsg("Mã OTP đã được gửi đến email của bạn.");
      } else {
        setError(result.message || "Không thể gửi OTP.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = element.value;
    setOtpArray(newOtp);
    setFormData({ ...formData, otp: newOtp.join("") });
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (formData.otp.length < 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    try {
      const fullName = email.split("@")[0];
      const res = await fetch(`/api/user/register`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          otp: formData.otp,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        onSuccess(result.message);
      } else {
        setError(result.message || "Đăng ký thất bại.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <div className="global-loading-overlay" style={{ zIndex: 100000, backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="auth-form-container" style={{ maxWidth: 450, position: "relative", backgroundColor: "#fff", padding: 30, borderRadius: 10 }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 15, right: 15, background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
        >
          &times;
        </button>
        <h2 style={{ textAlign: "center", marginBottom: 10 }}>Hoàn tất Đăng ký</h2>
        <p style={{ textAlign: "center", fontSize: 14, color: "#666", marginBottom: 20 }}>
          Email: <strong>{email}</strong>
        </p>

        {error && <div className="auth-alert-error"><i className="bi bi-exclamation-circle-fill"></i> {error}</div>}
        {successMsg && <div className="auth-alert-success"><i className="bi bi-check-circle-fill"></i> {successMsg}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-input-group">
            <label style={{ display: "block", textAlign: "center", marginBottom: 10 }}>Nhập mã OTP (6 số)</label>
            <div className="auth-otp-container" style={{ justifyContent: "center", gap: 10 }}>
              {otpArray.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="auth-otp-input"
                  style={{ width: 40, height: 50, textAlign: "center", fontSize: 20, border: "1px solid #ccc", borderRadius: 8 }}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 14 }}>
              Hết hạn sau: <strong style={{ color: "red" }}>{timeLeft}s</strong>
              <br />
              <button
                type="button"
                onClick={sendOtp}
                disabled={timeLeft > 0 || isSending}
                style={{ background: "none", border: "none", color: timeLeft > 0 ? "#aaa" : "blue", cursor: timeLeft > 0 ? "default" : "pointer", marginTop: 5, textDecoration: "underline" }}
              >
                Gửi lại OTP
              </button>
            </div>
          </div>

          <div className="auth-input-group" style={{ marginTop: 20 }}>
            <label>Mật khẩu mới</label>
            <input type="password" name="password" className="auth-input" style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 5, marginTop: 5 }} value={formData.password} onChange={handleChange} required minLength={6} placeholder="Nhập mật khẩu..." />
          </div>

          <div className="auth-input-group" style={{ marginTop: 15 }}>
            <label>Xác nhận mật khẩu</label>
            <input type="password" name="confirmPassword" className="auth-input" style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 5, marginTop: 5 }} value={formData.confirmPassword} onChange={handleChange} required minLength={6} placeholder="Xác nhận lại mật khẩu..." />
          </div>

          <button type="submit" className="auth-submit-btn" style={{ width: "100%", padding: 12, backgroundColor: "#c90000", color: "#fff", border: "none", borderRadius: 5, marginTop: 20, cursor: "pointer", fontSize: 16, fontWeight: "bold" }}>
            Xác Nhận & Đăng Ký
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterRegisterModal;
