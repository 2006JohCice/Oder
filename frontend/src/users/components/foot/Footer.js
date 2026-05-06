import React from "react";
import "../../css/foot/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo + mô tả */}
        <div className="footer-col">
          <h2 className="logo">ORDER SHOP</h2>
          <p>
            Order Shop là nền tảng hỗ trợ đặt bàn và đặt món ăn online nhanh chóng,
            tiện lợi và hiện đại.
          </p>


          <div className="social-icons">
            <i className="bi bi-facebook"></i>
            <i className="bi bi-instagram"></i>
            <i className="bi bi-envelope-fill"></i>
            <i className="bi bi-telephone-fill"></i>

          </div>
        </div>

        {/* Điều hướng */}
        <div className="footer-col">
          <h3>Điều Hướng</h3>
          <ul>
            <li>Trang Chủ</li>
            <li>Đặt Bàn</li>
            <li>Thực Đơn</li>
            <li>Ưu Đãi</li>
            <li>Liên Hệ</li>
          </ul>
        </div>

        {/* Dịch vụ */}
        <div className="footer-col">
          <h3>Dịch Vụ</h3>
          <ul>
            <li>Đặt bàn online</li>
            <li>Đặt món trước</li>
            <li>Giao đồ ăn</li>
            <li>Combo tiết kiệm</li>
            <li>Đặt tiệc</li>
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div className="footer-col">
          <h3>Hỗ Trợ</h3>
          <ul>
            <li>Về Chúng Tôi</li>
            <li>Chính Sách</li>
            <li>Điều Khoản</li>
            <li>Tuyển Dụng</li>
            <li>FAQ</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2026 Order Shop. All rights reserved.</p>
        <small>
          Disclaimer: Chúng tôi không trực tiếp cung cấp thực phẩm, tất cả đơn hàng
          được xử lý bởi đối tác nhà hàng.
        </small>
      </div>
    </footer>
  );
};

export default Footer;