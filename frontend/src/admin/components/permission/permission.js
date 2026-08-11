import React, { useEffect, useMemo, useState } from "react";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import "../../css/shared/admin-components.css";

const permissionGroups = [
  {
    title: "Danh mục",
    icon: "bi-tags",
    keys: [
      ["products-category-view", "Xem danh mục"],
      ["products-category-create", "Tạo mới"],
      ["products-category-update", "Cập nhật"],
      ["products-category-delete", "Xóa"],
    ],
  },
  {
    title: "Sản phẩm",
    icon: "bi-box-seam",
    keys: [
      ["products-view", "Xem sản phẩm"],
      ["products-create", "Tạo mới"],
      ["products-change-status", "Đổi trạng thái"],
      ["products-update", "Cập nhật"],
      ["products-delete", "Xóa"],
    ],
  },
  {
    title: "Vai trò & Phân quyền",
    icon: "bi-shield-lock",
    keys: [
      ["role-view", "Xem vai trò"],
      ["role-create", "Tạo mới"],
      ["role-update", "Cập nhật"],
      ["role-delete", "Xóa"],
      ["role-permission", "Phân quyền hệ thống"],
    ],
  },
  {
    title: "Quảng cáo & Banner",
    icon: "bi-image",
    keys: [
      ["advertisement-view", "Quản lý Banner"],
    ],
  },
];

const PermissionPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/role/permissions");
      const nextRoles = Array.isArray(res) ? res : [];
      setRoles(nextRoles);
      const nextMatrix = {};
      nextRoles.forEach((role) => {
        nextMatrix[role._id] = new Set(role.permissions || []);
      });
      setMatrix(nextMatrix);
    } catch (err) {
      if (err.status === 401) navigate("/admin/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const togglePermission = (roleId, permission) => {
    setMatrix((prev) => {
      const currentSet = new Set(prev[roleId] || []);
      if (currentSet.has(permission)) currentSet.delete(permission);
      else currentSet.add(permission);
      return { ...prev, [roleId]: currentSet };
    });
  };

  const hasChanges = useMemo(() => roles.length > 0, [roles]);

  const handleSubmit = async () => {
    const payload = roles.map((role) => ({
      roleId: role._id,
      permissions: Array.from(matrix[role._id] || []),
    }));

    try {
      const res = await fetch("/api/admin/role/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { notifyApp(data.message || "Cập nhật phân quyền thất bại", "error"); return; }
      notifyApp(data.message || "Cập nhật phân quyền thành công", "success");
      fetchData();
    } catch (err) {
      notifyApp("Lỗi khi cập nhật", "error");
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-key" style={{ color: "var(--adm-warning)", marginRight: 8 }} />
            Thiết lập phân quyền
          </h1>
          <p className="adm-page-sub">Cấu hình ma trận quyền truy cập cho từng nhóm người dùng</p>
        </div>
        <button className="adm-btn adm-btn--save" onClick={handleSubmit} disabled={!hasChanges}>
          <i className="bi bi-floppy" /> Lưu phân quyền
        </button>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-card-body" style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="adm-spinner" />
            <div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải ma trận quyền...</div>
          </div>
        ) : roles.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon"><i className="bi bi-shield-x" /></div>
            <div className="adm-empty-text">Chưa có vai trò nào được định nghĩa</div>
          </div>
        ) : (
          <div className="adm-card-body" style={{ padding: 0 }}>
            {permissionGroups.map((group, gIdx) => (
              <div key={group.title}>
                <div className="adm-perm-section-title" style={{ padding: "16px 20px", background: "#f8f9fb", borderBottom: "1px solid var(--adm-border)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className={`bi ${group.icon}`} style={{ color: "var(--adm-accent-dark)" }} />
                  {group.title}
                </div>
                <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
                  <table className="adm-perm-table">
                    {gIdx === 0 && (
                      <thead>
                        <tr>
                          <th>Chức năng</th>
                          {roles.map((role) => (
                            <th key={role._id}>{role.name}</th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {group.keys.map(([permissionKey, label]) => (
                        <tr key={permissionKey}>
                          <td>{label}</td>
                          {roles.map((role) => (
                            <td key={role._id}>
                              <label className="adm-toggle">
                                <input
                                  type="checkbox"
                                  checked={(matrix[role._id] || new Set()).has(permissionKey)}
                                  onChange={() => togglePermission(role._id, permissionKey)}
                                />
                                <span className="adm-toggle-slider" />
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionPage;
