import { useEffect, useMemo, useState } from "react";
import "../../css/user/user.css";
import PaginationHelper from "../../helpers/pagination";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function UsersAdmin() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchUsers = () => {
    let url = "/api/admin/userAdmin";
    const params = [];
    if (page > 1) params.push(`page=${page}`);
    if (statusFilter) params.push(`status=${statusFilter}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    apiFetch(url)
      .then((res) => {
        setUsers(res.data || []);
        setTotalPages(res.objPagination?.totalPages || 1);
      })
      .catch((err) => {
        if (err.status === 401) navigate("/admin/auth/login");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((item) => item.status === "active").length,
    inactive: users.filter((item) => item.status !== "active").length,
  }), [users]);

  const handleSave = async () => {
    const res = await fetch(`/api/admin/userAdmin/edit/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(selected),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyApp(data.message || "Cập nhật người dùng thất bại", "error");
      return;
    }
    notifyApp(data.message || "Cập nhật người dùng thành công", "success");
    setSelected(null);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/userAdmin/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      notifyApp(data.message || "Xóa người dùng thất bại", "error");
      return;
    }
    notifyApp(data.message || "Xóa người dùng thành công", "success");
    fetchUsers();
  };

  return (
    <>
      <section className="admin-grid admin-grid-4">
        <div className="admin-card">
          <h3>Tổng người dùng</h3>
          <div className="admin-big">{stats.total}</div>
        </div>
        <div className="admin-card">
          <h3>Hoạt động</h3>
          <div className="admin-big">{stats.active}</div>
        </div>
        <div className="admin-card">
          <h3>Tạm khóa</h3>
          <div className="admin-big">{stats.inactive}</div>
        </div>
      </section>

      <section className="admin-content" style={{ gridTemplateColumns: selected ? "2fr 1fr" : "1fr" }}>
        <div>
          <div className="admin-card admin-table">
            <div className="admin-toolbar">
              <div>
                <h3>Danh sách người dùng</h3>
                <div className="admin-muted">Quản lý tài khoản người dùng phía hệ thống.</div>
              </div>
              <select className="admin-select admin-select-inline" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role || "user"}</td>
                    <td><span className={`admin-badge ${u.status === "active" ? "admin-active" : ""}`}>{u.status}</span></td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button className="admin-btn" onClick={() => setSelected({ ...u })}>
                        <i className="bi bi-pen"></i>
                      </button>
                      <button className="admin-btn" onClick={() => handleDelete(u._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <PaginationHelper totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        </div>

        {selected && (
          <aside className="admin-panel">
            <div className="admin-card">
              <h3>Chỉnh sửa người dùng</h3>
              <div className="admin-editor" style={{ display: "grid", gap: "10px" }}>
                <input className="admin-input" value={selected.name || ""} onChange={(e) => setSelected({ ...selected, name: e.target.value })} />
                <input className="admin-input" value={selected.email || ""} onChange={(e) => setSelected({ ...selected, email: e.target.value })} />
                <input className="admin-input" value={selected.users || ""} onChange={(e) => setSelected({ ...selected, users: e.target.value })} />
                <select className="admin-select" value={selected.status || "active"} onChange={(e) => setSelected({ ...selected, status: e.target.value })}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
                <div className="admin-form-row">
                  <button className="admin-btn admin-primary" onClick={handleSave}>Lưu</button>
                  <button className="admin-btn" onClick={() => setSelected(null)}>Hủy</button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </section>
    </>
  );
}

export default UsersAdmin;
