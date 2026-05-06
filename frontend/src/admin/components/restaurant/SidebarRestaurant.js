import { Link, useLocation } from "react-router-dom";
import "../../css/SidebarRestaurant.css";

const SidebarRestaurant = ({ menuOpen, setMenuOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/restaurant-owner", label: "Tổng quan", icon: "bi bi-house-door" },
    { path: "/restaurant-owner/products", label: "Quản lý menu", icon: "bi bi-box-seam" },
    { path: "/restaurant-owner/orders", label: "Đơn hàng", icon: "bi bi-receipt" },
    { path: "/restaurant-owner/feedbacks", label: "Phản hồi khách", icon: "bi bi-chat-left-dots" },
    { path: "/restaurant-owner/reports", label: "Báo cáo nhà hàng", icon: "bi bi-flag" },
    { path: "/restaurant-owner/tables", label: "Quản lý bàn ăn", icon: "bi bi-grid-3x3-gap" },
    { path: "/restaurant-owner/settings", label: "Cài đặt", icon: "bi bi-gear" },
  ];

  return (
    <>
      <aside className={`sidebar-restaurant ${menuOpen ? "is-open" : ""}`}>
        <div className="sidebar-header"><h2>Quản lý nhà hàng</h2></div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
              <i className={item.icon}></i><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link" onClick={() => setMenuOpen(false)}>
            <i className="bi bi-arrow-left"></i><span>Về trang chủ</span>
          </Link>
        </div>
      </aside>
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}
    </>
  );
};

export default SidebarRestaurant;
