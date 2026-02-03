import { Link, useLocation } from "react-router-dom";
import "../css/components/SidebarAdmin.css";
import { prefixAdmin } from "../../config/system";
import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/apiFetch";

function SidebarAdmin() {
  // Phân quyền cho các account admin
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    apiFetch("/api/admin/auth/login/me")
      .then(res => {
        setUser(res.user);
        setRole(res.role);
      })
      .catch(() => {
        setUser(null);
        setRole(null);
      });
  }, []);

  const hasPermission = (permission) => {
    return role?.permissions?.includes(permission);
  };

  const [menuOpen, setMenuOpen] = useState(true);
  const location = useLocation();

  const pathname = location.pathname.substring(1);
  const pathname2 = pathname.split("/");
  pathname2.pop();
  const result = pathname2.join("/");

  return (
    <aside className={`admin-sidebar ${menuOpen ? "" : "close-admin-menu"}`}>
      {/* ===== BRAND ===== */}
      <div className="admin-brand admin-menu">
        <img className="admin-logo" src="/logo.jpg" alt="Admin Logo" />

        {menuOpen && (
          <div>
            <div className="admin-brand-title">Admin</div>
            <div className="admin-brand-sub">Order Shop</div>
          </div>
        )}

        <div
          className="admin-menu-toggle-wrapper"
          style={{ right: menuOpen ? "" : "-15px" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="admin-ico">
            {menuOpen ? (
              <i className="bi bi-arrow-bar-left"></i>
            ) : (
              <i className="bi bi-arrow-bar-right"></i>
            )}
          </span>
        </div>
      </div>

      {/* ===== MENU ===== */}
      <nav className="admin-menu">
        {/* Dashboard (luôn hiện) */}
        <Link
          to={`${prefixAdmin}admin`}
          className={pathname === "admin" ? "active" : ""}
        >
          <i className="admin-ico bi bi-house"></i>
          {menuOpen && <span className="admin-ico">Dashboard</span>}
        </Link>

        {/* Products */}
        {hasPermission("products-view") && (
          <Link
            to={`${prefixAdmin}admin/productsAdmin`}
            className={pathname === "admin/productsAdmin" ? "active" : ""}
          >
            <i className="admin-ico bi bi-bag"></i>
            {menuOpen && <span className="admin-ico">Products</span>}
          </Link>
        )}

        {/* Category */}
        {hasPermission("products-category-view") && (
          <Link
            to={`${prefixAdmin}admin/addCategory`}
            className={
              pathname === "admin/addCategory" ||
              result === "admin/editCategory"
                ? "active"
                : ""
            }
          >
            <i className="admin-ico bi bi-tags"></i>
            {menuOpen && <span className="admin-ico">Category</span>}
          </Link>
        )}

        {/* Users */}
        {hasPermission("role-permission") && (
          <Link
            to={`${prefixAdmin}admin/users`}
            className={pathname === "admin/users" ? "active" : ""}
          >
            <i className="admin-ico bi bi-people"></i>
            {menuOpen && <span className="admin-ico">Users</span>}
          </Link>
        )}

        {/* Roles */}
        {hasPermission("role-view") && (
          <Link
            to={`${prefixAdmin}admin/role`}
            className={
              pathname === "admin/role" ||
              pathname === "admin/role/create"
                ? "active"
                : ""
            }
          >
            <i className="admin-ico bi bi-shield-lock"></i>
            {menuOpen && <span className="admin-ico">Roles</span>}
          </Link>
        )}

        {/* Permission */}
        {hasPermission("role-permission") && (
          <Link
            to={`${prefixAdmin}admin/permission`}
            className={pathname === "admin/permission" ? "active" : ""}
          >
            <i className="admin-ico bi bi-key"></i>
            {menuOpen && <span className="admin-ico">Permission</span>}
          </Link>
        )}

        {/* Account */}
        {hasPermission("role-view") && (
          <Link
            to={`${prefixAdmin}admin/listAccount`}
            className={pathname === "admin/listAccount" ? "active" : ""}
          >
            <i className="bi bi-person-vcard"></i>
            {menuOpen && <span className="admin-ico">Account</span>}
          </Link>
        )}


        {/* Advertisement */}
        <Link to = {`${prefixAdmin}admin/advertisement`}
          className={pathname === "admin/advertisement" ? "active" : ""}>
          <i className="admin-ico bi bi-megaphone"></i>
          {menuOpen && <span className="admin-ico">Advertisement</span>}
        </Link>
        {/* Reports */}
        {hasPermission("role-permission") && (
          <Link
            to={`${prefixAdmin}admin/reports`}
            className={pathname === "admin/reports" ? "active" : ""}
          >
            <i className="admin-ico bi bi-book"></i>
            {menuOpen && <span className="admin-ico">Reports</span>}
          </Link>
        )}

        {/* Content */}
        {hasPermission("products-category-view") && (
          <Link
            to={`${prefixAdmin}admin/myeditor`}
            className={pathname === "admin/myeditor" ? "active" : ""}
          >
            <i className="admin-ico bi bi-cloud-upload"></i>
            {menuOpen && <span className="admin-ico">Content</span>}
          </Link>
        )}

        {/* Chatting */}
        <Link
          to={`${prefixAdmin}admin/chatting`}
          className={pathname === "admin/chatting" ? "active" : ""}
        >
          <i className="admin-ico bi bi-chat-dots"></i>
          {menuOpen && <span className="admin-ico">Chatting</span>}
        </Link>

        {/* Deleted */}
        {hasPermission("products-delete") && (
          <Link
            to={`${prefixAdmin}admin/deletedItems`}
            className={pathname === "admin/deletedItems" ? "active" : ""}
          >
            <i className="admin-ico bi bi-trash3"></i>
            {menuOpen && <span className="admin-ico">Delete</span>}
          </Link>
        )}

        {/* Settings */}
        <Link
          to={`${prefixAdmin}admin/setting`}
          className={pathname === "admin/setting" ? "active" : ""}
        >
          <i className="admin-ico bi bi-gear"></i>
          {menuOpen && <span className="admin-ico">Settings</span>}
        </Link>
      </nav>

      {/* ===== PROFILE ===== */}
      <div className="admin-profile">
        <div className="admin-avatar">
          {user?.fullname?.charAt(0) || "A"}
        </div>
        {menuOpen && (
          <div>
            <div className="admin-name">{user?.fullname}</div>
            <div className="admin-role">{role?.name || "Administrator"}</div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default SidebarAdmin;
