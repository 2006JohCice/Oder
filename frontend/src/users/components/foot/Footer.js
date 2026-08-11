import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/foot/Footer.css";
import NewsletterRegisterModal from "./NewsletterRegisterModal";

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("tokenUser");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setShowModal(true);
  };

  return (
    <footer className="gp-footer">
      {!isLoggedIn && (
        <div className="gp-footer-newsletter">
          <div className="gp-footer-container">
            <div className="gp-fn-content">
              <div className="gp-fn-text">
                <h3>Đăng ký nhận ưu đãi!</h3>
                <p>Nhận ngay mã giảm giá 50k cho đơn hàng đầu tiên và nhiều ưu đãi độc quyền hàng tuần.</p>
              </div>
              <form className="gp-fn-form" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Nhập địa chỉ email của bạn..." 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Đăng ký ngay</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <NewsletterRegisterModal 
          email={email} 
          onClose={() => setShowModal(false)} 
          onSuccess={(msg) => {
            alert(msg);
            setShowModal(false);
            window.location.reload(); // Reload to apply login state
          }} 
        />
      )}

      <div className="gp-footer-main">
        <div className="gp-footer-container">
          <div className="gp-footer-grid">
            
            {/* Cột 1: Thông tin thương hiệu */}
            <div className="gp-footer-col gp-fc-brand">
              <Link to="/" className="gp-footer-logo">
                GOURMET<span>PULSE</span>
              </Link>
              <p className="gp-fc-desc">
                Trải nghiệm ẩm thực tuyệt đỉnh ngay tại nhà. Chúng tôi kết nối bạn với những nhà hàng hàng đầu, đem đến bữa ăn nóng hổi và chất lượng nhất.
              </p>
              
              <div className="gp-fc-social">
                <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                <a href="#" aria-label="Tiktok"><i className="bi bi-tiktok"></i></a>
                <a href="#" aria-label="Youtube"><i className="bi bi-youtube"></i></a>
              </div>
            </div>

            {/* Cột 2: Dịch Vụ */}
            <div className="gp-footer-col">
              <h4>Dịch Vụ Nổi Bật</h4>
              <ul className="gp-fc-links">
                <li><Link to="/restaurants">Đặt đồ ăn trực tuyến</Link></li>
                <li><Link to="#">Đặt bàn nhà hàng</Link></li>
                <li><Link to="#">Siêu thị trực tuyến</Link></li>
                <li><Link to="#">Giao hàng hỏa tốc</Link></li>
                <li><Link to="#">Thẻ Quà Tặng (Gift Card)</Link></li>
              </ul>
            </div>

            {/* Cột 3: Về Chúng Tôi */}
            <div className="gp-footer-col">
              <h4>Về Chúng Tôi</h4>
              <ul className="gp-fc-links">
                <li><Link to="#">Câu chuyện thương hiệu</Link></li>
                <li><Link to="#">Cơ hội nghề nghiệp</Link></li>
                <li><Link to="#">Tin tức & Sự kiện</Link></li>
                <li><Link to="/restaurant/register">Đăng ký bán hàng</Link></li>
                <li><Link to="#">Trở thành tài xế</Link></li>
              </ul>
            </div>

            {/* Cột 4: Hỗ trợ & App */}
            <div className="gp-footer-col">
              <h4>Hỗ Trợ Khách Hàng</h4>
              <ul className="gp-fc-links">
                <li><Link to="#">Trung tâm trợ giúp</Link></li>
                <li><Link to="/legal/privacy">Chính sách bảo mật</Link></li>
                <li><Link to="/legal/terms">Điều khoản dịch vụ</Link></li>
                <li><Link to="#">Phản hồi khiếu nại</Link></li>
              </ul>
              
              <h4 className="gp-fc-app-title">Tải Ứng Dụng</h4>
              <div className="gp-fc-app-badges">
                <a href="#" className="gp-app-badge">
                  <i className="bi bi-apple"></i>
                  <div className="gp-ab-text">
                    <small>Tải trên</small>
                    <span>App Store</span>
                  </div>
                </a>
                <a href="#" className="gp-app-badge">
                  <i className="bi bi-google-play"></i>
                  <div className="gp-ab-text">
                    <small>Khám phá trên</small>
                    <span>Google Play</span>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="gp-footer-bottom">
        <div className="gp-footer-container">
          <div className="gp-fb-content">
            <div className="gp-fb-copyright">
              © {new Date().getFullYear()} Gourmet Pulse. All rights reserved. 
              <span className="gp-fb-disclaimer">Nền tảng công nghệ kết nối trực tiếp thực khách & nhà hàng.</span>
            </div>
            
            <div className="gp-fb-payments">
              <div className="gp-payment-icon" title="Visa">
                <i className="bi bi-credit-card"></i>
              </div>
              <div className="gp-payment-icon" title="Mastercard">
                <i className="bi bi-credit-card-fill"></i>
              </div>
              <div className="gp-payment-icon" title="Paypal">
                <i className="bi bi-paypal"></i>
              </div>
              <div className="gp-payment-icon" title="Cash">
                <i className="bi bi-cash-coin"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;