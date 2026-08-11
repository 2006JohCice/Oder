import { Link, useLocation } from "react-router-dom";
import "../css/components/SidebarAdmin.css";
import { prefixAdmin } from "../../config/system";
import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/apiFetch";

function SidebarAdmin({ menuOpen, setMenuOpen }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    apiFetch("/api/admin/auth/login/me")
      .then((res) => {
        setUser(res.user);
        setRole(res.role);
      })
      .catch(() => {
        setUser(null);
        setRole(null);
      });
  }, []);

  const hasPermission = (permission) => role?.permissions?.includes(permission);
  const location = useLocation();
  const pathname = location.pathname.substring(1);
  const pathnameParts = pathname.split("/");
  pathnameParts.pop();
  const result = pathnameParts.join("/");

  const handleNavigate = () => {
    if (window.innerWidth <= 1000) {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-backdrop ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-label="Close menu"
      />

      <aside className={`admin-sidebar ${menuOpen ? "show" : ""}`}>
        <div className="admin-brand">
          <i className="bi bi-hexagon-fill admin-logo-icon"></i>
          <span className="admin-brand-title">Order Admin!</span>
        </div>

        <div className="admin-profile-quick">
          <div className="admin-avatar">
            <img src="/logo.jpg" alt="Profile" className="img-circle" />
          </div>
          <div className="admin-profile-info">
            <span>Welcome,</span>
            <h2>{user?.fullname || "John Doe"}</h2>
          </div>
        </div>
        <br />

        <div className="admin-menu-section">
          <h3>GENERAL</h3>
        </div>

        <nav className="admin-menu">
          <Link to={`${prefixAdmin}admin`} className={pathname === "admin" ? "active" : ""} onClick={handleNavigate}>
            <i className="admin-ico bi bi-house"></i>
            <span>Dashboard</span>
          </Link>

          {hasPermission("products-view") && (
            <Link
              to={`${prefixAdmin}admin/productsAdmin`}
              className={pathname === "admin/productsAdmin" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-bag"></i>
              <span>Products</span>
            </Link>
          )}

          {hasPermission("products-view") && (
            <Link
              to={`${prefixAdmin}admin/orders`}
              className={pathname === "admin/orders" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-receipt-cutoff"></i>
              <span>Orders</span>
            </Link>
          )}

          {hasPermission("products-category-view") && (
            <Link
              to={`${prefixAdmin}admin/addCategory`}
              className={pathname === "admin/addCategory" || result === "admin/editCategory" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-tags"></i>
              <span>Category</span>
            </Link>
          )}

          {hasPermission("role-permission") && (
            <Link
              to={`${prefixAdmin}admin/users`}
              className={pathname === "admin/users" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-people"></i>
              <span>Users</span>
            </Link>
          )}

          {hasPermission("role-view") && (
            <Link
              to={`${prefixAdmin}admin/role`}
              className={pathname === "admin/role" || pathname === "admin/role/create" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-shield-lock"></i>
              <span>Roles</span>
            </Link>
          )}

          {hasPermission("role-permission") && (
            <Link
              to={`${prefixAdmin}admin/permission`}
              className={pathname === "admin/permission" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-key"></i>
              <span>Permission</span>
            </Link>
          )}

          {hasPermission("role-view") && (
            <Link
              to={`${prefixAdmin}admin/listAccount`}
              className={pathname === "admin/listAccount" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-person-vcard"></i>
              <span>Accounts</span>
            </Link>
          )}

          <Link
            to={`${prefixAdmin}admin/legal`}
            className={pathname === "admin/legal" ? "active" : ""}
            onClick={handleNavigate}
          >
            <i className="admin-ico bi bi-file-earmark-text"></i>
            <span>Pháp lý</span>
          </Link>

          {hasPermission("role-permission") && (
            <Link
              to={`${prefixAdmin}admin/restaurants`}
              className={pathname === "admin/restaurants" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-shop"></i>
              <span>Restaurants</span>
            </Link>
          )}

          <Link
            to={`${prefixAdmin}admin/advertisement`}
            className={pathname === "admin/advertisement" ? "active" : ""}
            onClick={handleNavigate}
          >
            <i className="admin-ico bi bi-megaphone"></i>
            <span>Advertisement</span>
          </Link>

          <Link
            to={`${prefixAdmin}admin/platform-vouchers`}
            className={pathname === "admin/platform-vouchers" ? "active" : ""}
            onClick={handleNavigate}
          >
            <i className="admin-ico bi bi-ticket-perforated"></i>
            <span>Voucher Sàn</span>
          </Link>

          <Link
            to={`${prefixAdmin}admin/seo`}
            className={pathname === "admin/seo" || pathname === "admin/seo/create" ? "active" : ""}
            onClick={handleNavigate}
          >
            <i className="admin-ico bi bi-globe"></i>
            <span>SEO & Blog</span>
          </Link>

          <Link
            to={`${prefixAdmin}admin/chatting`}
            className={pathname === "admin/chatting" ? "active" : ""}
            onClick={handleNavigate}
          >
            <i className="admin-ico bi bi-chat-dots"></i>
            <span>Chatting</span>
          </Link>

          {hasPermission("products-delete") && (
            <Link
              to={`${prefixAdmin}admin/deletedItems`}
              className={pathname === "admin/deletedItems" ? "active" : ""}
              onClick={handleNavigate}
            >
              <i className="admin-ico bi bi-trash3"></i>
              <span>Deleted</span>
            </Link>
          )}

          <Link
            to={`${prefixAdmin}admin/setting`}
            className={pathname === "admin/setting" ? "active" : ""}
            onClick={handleNavigate}
          >
            <i className="admin-ico bi bi-gear"></i>
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}

export default SidebarAdmin;
