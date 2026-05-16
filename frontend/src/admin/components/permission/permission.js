import React, { useEffect, useMemo, useState } from "react";
import "../../css/permission/permission.css";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";

const permissionGroups = [
  {
    title: "Danh mục",
    keys: [
      ["products-category-view", "Xem"],
      ["products-category-create", "Tạo mới"],
      ["products-category-update", "Cập nhật"],
      ["products-category-delete", "Xóa"],
    ],
  },
  {
    title: "Sản phẩm",
    keys: [
      ["products-view", "Xem"],
      ["products-create", "Tạo mới"],
      ["products-change-status", "Đổi trạng thái"],
      ["products-update", "Cập nhật"],
      ["products-delete", "Xóa"],
    ],
  },
  {
    title: "Vai trò",
    keys: [
      ["role-view", "Xem"],
      ["role-create", "Tạo mới"],
      ["role-update", "Cập nhật"],
      ["role-delete", "Xóa"],
      ["role-permission", "Phân quyền"],
    ],
  },
];

const PermissionPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [matrix, setMatrix] = useState({});

  const fetchData = async () => {
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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePermission = (roleId, permission) => {
    setMatrix((prev) => {
      const currentSet = new Set(prev[roleId] || []);
      if (currentSet.has(permission)) currentSet.delete(permission);
      else currentSet.add(permission);
      return {
        ...prev,
        [roleId]: currentSet,
      };
    });
  };

  const hasChanges = useMemo(() => roles.length > 0, [roles]);

  const handleSubmit = async () => {
    const payload = roles.map((role) => ({
      roleId: role._id,
      permissions: Array.from(matrix[role._id] || []),
    }));

    const res = await fetch("/api/admin/role/permissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyApp(data.message || "Cập nhật phân quyền thất bại", "error");
      return;
    }
    notifyApp(data.message || "Cập nhật phân quyền thành công", "success");
    fetchData();
  };

  return (
    <div className="permission">
      <div className="permission-container">
        <div className="admin-toolbar" style={{ marginBottom: 16 }}>
          <div>
            <h3>Thiết lập phân quyền</h3>
            <div className="admin-muted">Chỉnh quyền theo từng nhóm vai trò trong hệ thống.</div>
          </div>
          <button className="permission-btn-update" onClick={handleSubmit} disabled={!hasChanges}>
            Cập nhật
          </button>
        </div>

        {permissionGroups.map((group) => (
          <React.Fragment key={group.title}>
            <div className="permission-section-title">{group.title}</div>
            <table className="permission-table">
              <thead>
                <tr>
                  <th>Chức năng</th>
                  {roles.map((role) => (
                    <th key={role._id}>{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.keys.map(([permissionKey, label]) => (
                  <tr key={permissionKey}>
                    <td>{label}</td>
                    {roles.map((role) => (
                      <td key={role._id}>
                        <input
                          type="checkbox"
                          checked={(matrix[role._id] || new Set()).has(permissionKey)}
                          onChange={() => togglePermission(role._id, permissionKey)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PermissionPage;
