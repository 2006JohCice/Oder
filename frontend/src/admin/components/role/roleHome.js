import "../../css/products/ProductsAdmin.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

const RoleHome = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const fetchData = () => {
    apiFetch("/api/admin/role")
      .then((roles) => {
        setData(Array.isArray(roles) ? roles : []);
      })
      .catch((err) => {
        if (err.status === 401) {
          navigate("/admin/auth/login");
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/role/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) {
        notifyApp(payload.message || "Xóa vai trò thất bại", "error");
        return;
      }
      notifyApp(payload.message || "Xóa vai trò thành công", "success");
      fetchData();
    } catch (error) {
      notifyApp("Lỗi khi xóa vai trò", "error");
    }
  };

  return (
    <div className="products-page">
      <div className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h3>Vai trò và phân quyền</h3>
            <div className="admin-muted">Quản lý nhóm quyền dùng cho toàn bộ khu vực quản trị.</div>
          </div>
          <Link to="/admin/role/create">
            <button className="btn-accent" type="button">
              + Thêm vai trò
            </button>
          </Link>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên vai trò</th>
              <th>Mô tả</th>
              <th>Số quyền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{Array.isArray(item.permissions) ? item.permissions.length : 0}</td>
                <td style={{ display: "flex", gap: "8px" }}>
                  <Link to={`/admin/role/edit/${item._id}`}>
                    <button className="admin-btn">Sửa</button>
                  </Link>
                  <button className="admin-btn" onClick={() => handleDelete(item._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleHome;
