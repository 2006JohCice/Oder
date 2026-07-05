import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/AuthUser.css";

const LoginPageUserForgot = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    verificationCode: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");
  const [step, setStep] = useState(1); // Step 1: Request Email, Step 2: Verify & Reset

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert("");
    setMessage("");

    try {
      const res = await fetch(`/api/user/password/forgot`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStep(2);
        setAlert(result.message || "Mã xác nhận đã được gửi vào email của bạn.");
      } else {
        setMessage(result.message || "Email không tồn tại trong hệ thống.");
      }
    } catch (error) {
      console.error("Lỗi kết nối server Error:", error);
      setAlert("Lỗi kết nối server: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otpArray];
    newOtp[index] = element.value;
    setOtpArray(newOtp);
    setFormData(prev => ({ ...prev, verificationCode: newOtp.join("") }));
    
    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otpArray];
    pastedData.forEach((char, i) => {
      if (!isNaN(char) && i < 6) newOtp[i] = char;
    });
    setOtpArray(newOtp);
    setFormData(prev => ({ ...prev, verificationCode: newOtp.join("") }));
    
    const lastInput = document.getElementById(`otp-${Math.min(pastedData.length - 1, 5)}`);
    if (lastInput) lastInput.focus();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        otp: formData.verificationCode
      };

      const res = await fetch(`/api/user/password/otp`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        window.alert("Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại.");
        navigate("/user/auth/login");
      } else {
        setMessage(result.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setMessage("Lỗi kết nối server: " + error.message);
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

          <h1 className="auth-title">Khôi phục mật khẩu</h1>
          <p className="auth-subtitle">
            {step === 1 ? "Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi mã khôi phục." : "Nhập mã xác nhận từ email và tạo mật khẩu mới của bạn."}
          </p>

          {message && <div className="auth-alert-error"><i className="bi bi-exclamation-circle-fill"></i> {message}</div>}
          {alert && <div className="auth-alert-success"><i className="bi bi-check-circle-fill"></i> {alert}</div>}

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleRequestCode}>
              <div className="auth-input-group">
                <label>Email đã đăng ký</label>
                <i className="bi bi-envelope auth-input-icon"></i>
                <input type="email" name="email" className="auth-input" placeholder="example@domain.com" value={formData.email} onChange={handleChange} required />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? "Đang gửi..." : "Gửi Liên Kết Khôi Phục"}
                {!isLoading && <i className="bi bi-send-fill"></i>}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="auth-input-group">
                <label style={{textAlign: 'center', display: 'block', fontSize: 16, marginBottom: 15}}>Nhập mã OTP 6 số</label>
                <div className="auth-otp-container" onPaste={handleOtpPaste}>
                  {otpArray.map((data, index) => {
                    return (
                      <input
                        className="auth-otp-input"
                        type="text"
                        name="otp"
                        maxLength="1"
                        key={index}
                        id={`otp-${index}`}
                        value={data}
                        onChange={e => handleOtpChange(e.target, index)}
                        onKeyDown={e => handleOtpKeyDown(e, index)}
                        onFocus={e => e.target.select()}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="auth-input-group">
                <label>Mật khẩu mới</label>
                <i className="bi bi-lock auth-input-icon"></i>
                <input type="password" name="newPassword" className="auth-input" placeholder="Tạo mật khẩu mới" value={formData.newPassword} onChange={handleChange} required minLength={6} />
              </div>

              <div className="auth-input-group">
                <label>Xác nhận mật khẩu mới</label>
                <i className="bi bi-shield-lock auth-input-icon"></i>
                <input type="password" name="confirmPassword" className="auth-input" placeholder="Nhập lại mật khẩu mới" value={formData.confirmPassword} onChange={handleChange} required minLength={6} />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? "Đang cập nhật..." : "Đặt Lại Mật Khẩu"}
                {!isLoading && <i className="bi bi-check2-circle"></i>}
              </button>

              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Chưa nhận được mã?{" "}
                  <button 
                    type="button" 
                    onClick={handleRequestCode}
                    style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontWeight: "bold", padding: 0 }}
                    disabled={isLoading}
                  >
                    Gửi lại mã
                  </button>
                </span>
              </div>
            </form>
          )}

          <div className="auth-switch-page">
            <Link to="/user/auth/login"><i className="bi bi-arrow-left"></i> Quay lại Đăng nhập</Link>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: BANNER */}
      <div className="auth-right">
        <img src="https://images.unsplash.com/photo-1495474472204-51e4431f4a92?auto=format&fit=crop&w=1920&q=80" alt="Coffee Banner" className="auth-banner-img" style={{opacity: 0.7}} />
        <div className="auth-banner-overlay"></div>
        <div className="auth-banner-content">
          <h2>Mọi chuyện rồi sẽ ổn thôi.</h2>
          <p>Hệ thống bảo mật của Gourmet Pulse luôn ở đây để bảo vệ tài khoản và dữ liệu của bạn an toàn tuyệt đối.</p>
          
          <div className="auth-tags">
            <div className="auth-tag"><i className="bi bi-shield-lock-fill" style={{color:'#fbd38d'}}></i> Bảo mật 2 lớp</div>
            <div className="auth-tag"><i className="bi bi-envelope-check-fill" style={{color:'#fbd38d'}}></i> Khôi phục qua Email</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPageUserForgot;
