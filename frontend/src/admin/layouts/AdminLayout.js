import React, { useEffect, useState } from "react";
import "../layouts/AdminLayout.css";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { Routes, Route } from "react-router-dom";
import ProductsAdmin from "../components/products/ProductsAdmin";
import MainAdmin from "../components/MainAdmin";
import UsersAdmin from "../components/users/usersAdmin";
import "../css/effects.css";
import ReportsAdmin from "../components/Reports/ReportsAdmin";
import SettingsAdmin from "../components/setting/SettingAdmin";
import Could from "../components/could/Could";
import ChatUI from "../components/chatting/Chatting";
import ProductsBackUp from "../components/backUp/ProductsAdmin.backUp";
import MyEditor from "../components/tinyMCE/MyEditor";
import AddCategory from "../components/AddCategory/AddCategory";
import EditCategory from "../components/AddCategory/editCAtegory";
import RoleHome from "../components/role/roleHome";
import RoleCreate from "../components/role/roleCreate";
import RoleEdit from "../components/role/roleEdit";
import PermissionPage from "../components/permission/permission";
import Account from "../components/account/account";
import Advertisement from "../components/ads/advertisement";
import { apiFetch } from "../../utils/apiFetch";
import Order from "../components/order/order";
import RestaurantManagement from "../components/restaurant/RestaurantManagement";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="admin-app">
      <div className="admin-container">
        <SidebarAdmin menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <main className="admin-main">
          <HeaderAdmin query={query} setQuery={setQuery} setMenuOpen={setMenuOpen} user={user} />
          <Routes>
            {role && role.permissions.length > 0 && (
              <>
                <Route path="/" element={<MainAdmin query={query} />} />
                <Route
                  path="/productsAdmin"
                  element={role?.permissions?.includes("products-view") ? <ProductsAdmin query={query} /> : ""}
                />
                <Route
                  path="/orders"
                  element={role?.permissions?.includes("products-view") ? <Order query={query} /> : ""}
                />
                <Route
                  path="/users"
                  element={role?.permissions?.includes("role-permission") ? <UsersAdmin query={query} /> : ""}
                />
                <Route
                  path="/addCategory"
                  element={role?.permissions?.includes("products-category-view") ? <AddCategory /> : ""}
                />
                <Route
                  path="/editCategory/:id"
                  element={role?.permissions?.includes("products-category-update") ? <EditCategory /> : ""}
                />
                <Route
                  path="/listAccount"
                  element={role?.permissions?.includes("role-view") ? <Account /> : ""}
                />
                <Route
                  path="/reports"
                  element={role?.permissions?.includes("role-permission") ? <ReportsAdmin /> : ""}
                />
                <Route path="/deailCloud" element={<Could />} />
                <Route path="/setting" element={<SettingsAdmin />} />
                <Route path="/chatting" element={<ChatUI />} />
                <Route path="/advertisement" element={<Advertisement />} />
                <Route
                  path="/myeditor"
                  element={role?.permissions?.includes("products-category-view") ? <MyEditor /> : ""}
                />
                <Route
                  path="/deletedItems"
                  element={role?.permissions?.includes("products-delete") ? <ProductsBackUp /> : ""}
                />
                <Route
                  path="/role"
                  element={role?.permissions?.includes("role-view") ? <RoleHome /> : ""}
                />
                <Route
                  path="/role/create"
                  element={role?.permissions?.includes("role-create") ? <RoleCreate /> : ""}
                />
                <Route
                  path="/role/edit/:id"
                  element={role?.permissions?.includes("role-update") ? <RoleEdit /> : ""}
                />
                <Route
                  path="/permission"
                  element={role?.permissions?.includes("role-permission") ? <PermissionPage /> : ""}
                />
                <Route
                  path="/restaurants"
                  element={role?.permissions?.includes("role-permission") ? <RestaurantManagement /> : ""}
                />
              </>
            )}
          </Routes>

          <footer className="admin-footer">© {new Date().getFullYear()} Order Admin</footer>
        </main>
      </div>
    </div>
  );
}
