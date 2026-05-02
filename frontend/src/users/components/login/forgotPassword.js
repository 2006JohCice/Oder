import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const RegisterPageUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messagePassword, setMessagePassword] = useState("");
  const [alert, setAlert] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [sendOtp, setSendOtp] = useState(false);

  // Validate passwords match whenever password fields change
  useEffect(() => {
    if (formData.password && formData.confirmPassword && formData.email) {
      setSendOtp(formData.password === formData.confirmPassword);
    } else {

      setSendOtp(false);
    }
  }, [formData.password, formData.confirmPassword, formData.email]);

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handlClickOtp = async (e) => {
    setMessage("");
    setMessagePassword("");

    const url = "/api/user/password/forgot";
    try {
      setTimeLeft(60);
      const res = await fetch(url, {
        method: "POST",
        //   credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      setMessage(result.message);
      setMessagePassword(result.messagePassword);
      setAlert(result.alerts);
    } catch (error) {
      console.error("Lỗi kết nối server Error:", error);
      // setMessage("");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessagePassword("");

    const url = "/api/user/password/otp";
    try {
      const res = await fetch(url, {
        method: "POST",
        //   credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        navigate("/user/auth/login");
      } else {
        setMessage(result.message);
        setMessagePassword(result.messagePassword);
        setAlert(result.alerts);
      }
    } catch (error) {
      console.error("Lỗi kết nối server Error:", error);
      // setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT */}
      <div className="login-left">
        <div className="login-box">
          <header className="login-header">
            <div className="icon-login">
              <img
                className="admin-logo_login"
                alt="Admin Logo"
                src="/Textlogo.png"
              />
              {/* <h1 className="logo-text" style={{ color: "#c00" }}>ORDER</h1>
                            <h1 className="logo-text" style={{ color: "#c00" }}>SHOP</h1> */}
            </div>
            <p className="subtitle" style={{ color: "#c00" }}>
              Order - Shop
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              {message && <div className="error-alert">{message}</div>}
              <input
                type="text"
                name="email"
                placeholder="Email "
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              {messagePassword && (
                <div className="error-alert">{messagePassword}</div>
              )}
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu mới"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              {messagePassword && (
                <div className="error-alert">{messagePassword}</div>
              )}
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác Nhập Lại Mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                name="otp"
                placeholder="Xác Thực OTP Qua Email"
                value={formData.otp}
                onChange={handleChange}
                required
              />
              {/* <button type="button" className="btn btn-info" style={{ marginTop: "10px",borderRadius:"10px" }} onClick ={handlClickOtp}>Gửi OTP</button> */}
              <button
                type="button"
                className="btn btn-info"
                style={{ marginTop: "10px", borderRadius: "10px", backgroundColor: sendOtp ? "#007bff" : "#ccc", color: "#fff", border: "none", cursor: sendOtp ? "pointer" : "not-allowed", padding: "10px 20px" }}
                onClick={handlClickOtp}
                disabled={timeLeft > 0 || sendOtp === false}
              >
                {timeLeft > 0 ? `Gửi lại sau (${timeLeft}s)` : "Gửi OTP"}
              </button>
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Đang Ktra..." : "Thay Đổi"}
            </button>
          </form>

          <div
            className="login-footer"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Link to="/user/auth/register" className="forgot-password">
              Đăng Ký Mới
            </Link>
            <Link to="/user/auth/login" className="forgot-password">
              Đăng Nhập
            </Link>
          </div>
          {alert && <div className="error-alert">{alert}</div>}
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="right-content">
          {/* <h1 className="right-logo"><span>LO</span><span>GO</span></h1> */}
          <a href="/" class="mb-0 mb-lg-12">
            <img
              alt="Logo"
              src="/Textlogo.png"
              class="h-60px h-lg-75px"
              style={{ width: "190px" }}
            ></img>
          </a>

          <div className="mockup-area">
            <img src="/Textlogo.png" alt="dashboard" />
          </div>

          <h2>Nhanh - Gọn - Lẹ</h2>
          <p>Nếu Bạn Quên Gửi Lời Yêu Thương Xin Đừng Lo Chúng Tôi Sẽ Gửi Lời Yêu Thương Nhanh Nhất. </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPageUser;
