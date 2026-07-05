import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/AuthUser.css";

const RegisterPageUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/register/passwordOtp`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStep(2);
        setTimeLeft(300);
        setAlert("Mã OTP đã được gửi đến email của bạn.");
      } else {
        setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setError("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    
    setIsLoading(true);
    setError("");
    setAlert("");
    
    try {
      const res = await fetch(`/api/user/register/passwordOtp`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTimeLeft(300);
        setAlert("Mã OTP mới đã được gửi đến email của bạn.");
      } else {
        setError(result.message || "Không thể gửi lại OTP.");
      }
    } catch (error) {
      setError("Lỗi kết nối server.");
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
    setFormData(prev => ({ ...prev, otp: newOtp.join("") }));
    
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
    setFormData(prev => ({ ...prev, otp: newOtp.join("") }));
    
    const lastInput = document.getElementById(`otp-${Math.min(pastedData.length - 1, 5)}`);
    if (lastInput) lastInput.focus();
  };

  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/user/register`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        navigate("/user/auth/login");
      } else {
        setError(result.message || "Mã OTP không hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setError("Lỗi kết nối server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      
      {/* LEFT SIDE: FORM */}
      <div className="auth-left">
        <div className="auth-form-container" style={{maxWidth: 500}}>
          
          <Link to="/" className="auth-logo">
            <img src="/Textlogo.png" alt="Gourmet Pulse Logo" style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(87%) saturate(5885%) hue-rotate(352deg) brightness(89%) contrast(110%)' }} />
          </Link>

          <h1 className="auth-title">{step === 1 ? "Tham gia cùng chúng tôi" : "Xác nhận OTP"}</h1>
          <p className="auth-subtitle">
            {step === 1 ? "Tạo tài khoản miễn phí để tận hưởng các đặc quyền." : "Vui lòng kiểm tra email và nhập mã xác nhận 6 số để hoàn tất."}
          </p>

          {error && <div className="auth-alert-error"><i className="bi bi-exclamation-circle-fill"></i> {error}</div>}
          {alert && step === 2 && <div className="auth-alert-success"><i className="bi bi-check-circle-fill"></i> {alert}</div>}

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleRequestOtp}>
              
              <div className="auth-input-group">
                <label>Họ và Tên</label>
                <i className="bi bi-person auth-input-icon"></i>
                <input type="text" name="fullName" className="auth-input" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} required />
              </div>

              <div className="auth-input-group">
                <label>Email</label>
                <i className="bi bi-envelope auth-input-icon"></i>
                <input type="email" name="email" className="auth-input" placeholder="example@domain.com" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="auth-form-row">
                <div className="auth-input-group">
                  <label>Mật khẩu</label>
                  <i className="bi bi-lock auth-input-icon"></i>
                  <input type="password" name="password" className="auth-input" placeholder="Tạo mật khẩu" value={formData.password} onChange={handleChange} required minLength={6} />
                </div>

                <div className="auth-input-group">
                  <label>Xác nhận Mật khẩu</label>
                  <i className="bi bi-shield-lock auth-input-icon"></i>
                  <input type="password" name="confirmPassword" className="auth-input" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required minLength={6} />
                </div>
              </div>

              <div className="auth-options" style={{marginTop: 5}}>
                <label className="auth-checkbox">
                  <input type="checkbox" required /> Tôi đồng ý với Điều khoản dịch vụ & Chính sách bảo mật.
                </label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Tiếp Tục (Nhận mã OTP)"}
                {!isLoading && <i className="bi bi-arrow-right"></i>}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifyOtpAndRegister}>
              <div className="auth-input-group">
                <label style={{textAlign: 'center', display: 'block', fontSize: 16, marginBottom: 15, fontWeight: '600', color: '#333'}}>Nhập mã OTP 6 số</label>
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

              <div className="auth-timer-container" style={{textAlign: 'center', marginBottom: 15}}>
                <span style={{fontSize: 14, color: '#666'}}>Mã OTP hết hạn sau: </span>
                <span style={{fontSize: 18, fontWeight: 'bold', color: timeLeft > 60 ? '#c90000' : '#e53e3e'}}>{formatTime(timeLeft)}</span>
              </div>
              
              <div className="auth-resend-container" style={{textAlign: 'center', marginBottom: 25}}>
                <span style={{fontSize: 14, color: '#666'}}>Chưa nhận được mã? </span>
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0 || isLoading}
                  style={{
                    background: 'none', 
                    border: 'none', 
                    color: timeLeft > 0 ? '#a0aec0' : '#c90000', 
                    fontWeight: 'bold',
                    cursor: timeLeft > 0 ? 'not-allowed' : 'pointer',
                    padding: 0,
                    textDecoration: timeLeft > 0 ? 'none' : 'underline'
                  }}
                >
                  Gửi lại OTP
                </button>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading || otpArray.join('').length < 6}>
                {isLoading ? "Đang xử lý..." : "Xác Nhận & Đăng Ký"}
                {!isLoading && <i className="bi bi-check2-circle"></i>}
              </button>

              <button type="button" onClick={() => setStep(1)} className="auth-submit-btn" style={{background: '#edf2f7', color: '#4a5568', marginTop: 10}}>
                <i className="bi bi-arrow-left"></i> Quay lại
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="auth-switch-page">
              Đã có tài khoản? <Link to="/user/auth/login">Đăng nhập</Link>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE: BANNER */}
      <div className="auth-right">
        <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1920&q=80" alt="Food Banner" className="auth-banner-img" />
        <div className="auth-banner-overlay"></div>
        <div className="auth-banner-content">
          <h2>Đăng ký một lần<br/>Trải nghiệm trọn đời.</h2>
          <p>Gourmet Pulse kết nối bạn với những nhà hàng đẳng cấp, mang đến các chương trình khuyến mãi độc quyền chỉ dành riêng cho thành viên.</p>
          
          <div className="auth-tags">
            <div className="auth-tag"><i className="bi bi-gift-fill" style={{color:'#fbd38d'}}></i> Ưu đãi độc quyền</div>
            <div className="auth-tag"><i className="bi bi-check-circle-fill" style={{color:'#fbd38d'}}></i> Nhanh chóng & An toàn</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPageUser;
