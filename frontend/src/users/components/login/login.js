import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/AuthUser.css";

const LoginPageUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messagePassword, setMessagePassword] = useState("");
  const [alert, setAlert] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessagePassword("");
    setAlert("");
    
    try {
      const res = await fetch(`/api/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok) {
        navigate("/");
      } else {
        setMessage(result.message || "");
        setMessagePassword(result.messagePassword || "");
        setAlert(result.alerts || "");
      }
    } catch (error) {
      console.error("Lỗi kết nối server Error:", error);
      setAlert("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      
      {/* LEFT SIDE: FORM */}
      <div className="auth-left">
        <div className="auth-form-container">
          
          <Link to="/" className="auth-logo">
            <img src="/Textlogo.png" alt="Gourmet Pulse Logo" style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(87%) saturate(5885%) hue-rotate(352deg) brightness(89%) contrast(110%)' }} />
          </Link>

          <h1 className="auth-title">Chào mừng trở lại!</h1>
          <p className="auth-subtitle">Vui lòng đăng nhập để tiếp tục khám phá ẩm thực.</p>

          {alert && <div className="auth-alert-error"><i className="bi bi-exclamation-circle-fill"></i> {alert}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            
            <div className="auth-input-group">
              <label>Email hoặc Số điện thoại</label>
              <i className="bi bi-envelope auth-input-icon"></i>
              <input
                type="text"
                name="email"
                className="auth-input"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {message && <div style={{color:'#e53e3e', fontSize: 12, marginTop: 5}}>{message}</div>}
            </div>

            <div className="auth-input-group">
              <label>Mật khẩu</label>
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {messagePassword && <div style={{color:'#e53e3e', fontSize: 12, marginTop: 5}}>{messagePassword}</div>}
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <Link to="/user/auth/forgot-password" className="auth-forgot-link">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
              {!isLoading && <i className="bi bi-arrow-right"></i>}
            </button>

          </form>

          <div className="auth-switch-page">
            Chưa có tài khoản? <Link to="/user/auth/register">Đăng ký ngay</Link>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: BANNER */}
      <div className="auth-right">
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80" alt="Food Banner" className="auth-banner-img" />
        <div className="auth-banner-overlay"></div>
        <div className="auth-banner-content">
          <h2>Hương vị đỉnh cao<br/>Ngay trong tầm tay.</h2>
          <p>Tham gia cộng đồng Gourmet Pulse để trải nghiệm những bữa ăn tuyệt vời nhất từ hàng ngàn nhà hàng đối tác.</p>
          
          <div className="auth-tags">
            <div className="auth-tag"><i className="bi bi-star-fill" style={{color:'#fbd38d'}}></i> Đánh giá thực tế</div>
            <div className="auth-tag"><i className="bi bi-lightning-fill" style={{color:'#fbd38d'}}></i> Đặt bàn siêu tốc</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPageUser;