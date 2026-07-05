import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../css/RestaurantOwnerLayout.css";

const SidebarRestaurant = ({ isOpen, setIsOpen, restaurant }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/restaurant-owner", label: "Dashboard", icon: "bi bi-grid" },
    { path: "/restaurant-owner/orders", label: "Live Orders", icon: "bi bi-activity" },
    { path: "/restaurant-owner/order-list", label: "Order List", icon: "bi bi-receipt" },
    { path: "/restaurant-owner/products", label: "Menu Management", icon: "bi bi-cup-hot" },
    { path: "/restaurant-owner/vouchers", label: "Mã giảm giá (Vouchers)", icon: "bi bi-ticket-perforated" },
    { path: "/restaurant-owner/tables", label: "Table Management", icon: "bi bi-border-all" },
    { path: "/restaurant-owner/reports", label: "Analytics", icon: "bi bi-bar-chart" },
    { path: "/restaurant-owner/feedbacks", label: "Customer Care", icon: "bi bi-chat-heart" },
  ];

  return (
    <aside className={`sidebar-restaurant ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">BG</div>
        <div className="sidebar-logo-text">
          <h2>Bistro Gourmet</h2>
          <p>Merchant Portal</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          // Xử lý active state linh hoạt hơn (vì path exact có thể k match nếu có subroute)
          const isActive = item.path === "/restaurant-owner" 
            ? location.pathname === "/restaurant-owner"
            : location.pathname.startsWith(item.path);

          return (
            <Link key={item.path} to={item.path} className={`sidebar-link ${isActive ? "active" : ""}`}>
              <i className={item.icon}></i><span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link to="/restaurant-owner/settings" className={`sidebar-link ${location.pathname === '/restaurant-owner/settings' ? 'active' : ''}`} style={{marginBottom: 15}}>
            <i className="bi bi-gear"></i><span>Settings</span>
        </Link>
        <Link to="/" className="sidebar-link" style={{marginBottom: 15}}>
            <i className="bi bi-box-arrow-right"></i><span>Logout</span>
        </Link>
        <Link to={`/restaurant/${restaurant?.slug || restaurant?._id}/products`} className="sidebar-footer-btn" target="_blank">
          <i className="bi bi-box-arrow-up-right" style={{marginRight: 8}}></i> View Storefront
        </Link>
      </div>
    </aside>
  );
};

export default SidebarRestaurant;
