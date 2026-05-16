import { useEffect, useMemo, useState } from "react";
import "../../css/user/user.css";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function Account() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState([]);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    phone: "",
    users: "",
    password: "",
    role_id: "",
    status: "active",
  });

  const fetchAccounts = () => {
    apiFetch("/api/admin/listAccount")
      .then((res) => setUsers(res.records || []))
      .catch((err) => {
        if (err.status === 401) navigate("/admin/auth/login");
      });
  };

  const fetchRole = () => {
    apiFetch("/api/admin/listAccount/create")
      .then((res) => setRole(Array.isArray(res) ? res : []))
      .catch((err) => {
        if (err.status === 401) navigate("/admin/auth/login");
      });
  };

  useEffect(() => {
    fetchRole();
    fetchAccounts();
  }, []);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((item) => item.status === "active").length,
  }), [users]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selected?._id) return;

    const res = await fetch(`/api/admin/listAccount/edit/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(selected),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      notifyApp(data?.message || "Cập nhật tài khoản thất bại", "error");
      return;
    }

    notifyApp("Cập nhật tài khoản thành công", "success");
    setSelected(null);
    fetchAccounts();
  };

  const fetchApiUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/listAccount/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      notifyApp(data.message, res.ok ? "success" : "error");
      if (res.ok) {
        setShowAddUser(false);
        setNewUser({
          fullname: "",
          email: "",
          phone: "",
          users: "",
          password: "",
          role_id: "",
          status: "active",
        });
        fetchAccounts();
      }
    } catch (err) {
      notifyApp("Lỗi tạo tài khoản", "error");
    }
  };

  return (
    <>
      <section className="admin-grid admin-grid-4">
        <div className="admin-card">
          <h3>Tổng tài khoản</h3>
          <div className="admin-big">{stats.total}</div>
        </div>
        <div className="admin-card">
          <h3>Hoạt động</h3>
          <div className="admin-big">{stats.active}</div>
        </div>
      </section>

      <section className="admin-content" style={{ gridTemplateColumns: selected || showAddUser ? "2fr 1fr" : "1fr" }}>
        <div>
          <div className="admin-card admin-table">
            <div className="admin-toolbar">
              <div>
                <h3>Quản lý tài khoản quản trị</h3>
                <div className="admin-muted">Tài khoản dùng cho admin, staff và các nhóm nội bộ.</div>
              </div>
              <button className="admin-btn admin-primary" onClick={() => { setSelected(null); setShowAddUser(true); }}>
                Thêm tài khoản
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td>{u.fullname}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.role?.name}</td>
                    <td>{u.status}</td>
                    <td>
                      <button className="admin-btn" onClick={() => { setSelected({ ...u, password: "" }); setShowAddUser(false); }}>
                        <i className="bi bi-pen"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="admin-panel">
          {showAddUser && (
            <section className="admin-card">
              <h3>Thêm tài khoản</h3>
              <form className="admin-editor" style={{ display: "grid", gap: "10px" }} onSubmit={fetchApiUser}>
                <input className="admin-input" required placeholder="Tên người dùng" type="text" value={newUser.fullname} onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })} />
                <input className="admin-input" required placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input className="admin-input" required placeholder="Số điện thoại" type="text" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                <input className="admin-input" required placeholder="Tên đăng nhập" type="text" value={newUser.users} onChange={(e) => setNewUser({ ...newUser, users: e.target.value })} />
                <input className="admin-input" required placeholder="Mật khẩu" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <select className="admin-select" value={newUser.role_id} onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}>
                  <option value="">Chọn vai trò</option>
                  {role.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
                <select className="admin-select" value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}>
                  <option value="active">Hoạt động</option>
                  <option value="inActive">Tạm dừng</option>
                </select>
                <button type="submit" className="admin-btn admin-primary">Tạo tài khoản</button>
              </form>
            </section>
          )}

          {selected && (
            <div className="admin-card">
              <h3>Sửa tài khoản</h3>
              <form onSubmit={handleSave}>
                <div className="admin-editor" style={{ display: "grid", gap: "10px" }}>
                  <input className="admin-input" value={selected.fullname} onChange={(e) => setSelected({ ...selected, fullname: e.target.value })} required />
                  <input className="admin-input" value={selected.email} onChange={(e) => setSelected({ ...selected, email: e.target.value })} required />
                  <input className="admin-input" value={selected.phone || ""} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} />
                  <input className="admin-input" placeholder="Mật khẩu mới (để trống nếu không đổi)" value={selected.password || ""} onChange={(e) => setSelected({ ...selected, password: e.target.value })} />
                  <select className="admin-select" value={selected.role_id || ""} onChange={(e) => setSelected({ ...selected, role_id: e.target.value })}>
                    <option value="">Chọn vai trò</option>
                    {role.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                  <select className="admin-select" value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value })}>
                    <option value="active">Hoạt động</option>
                    <option value="inActive">Tạm dừng</option>
                  </select>
                  <div className="admin-form-row">
                    <button className="admin-btn admin-primary" type="submit">Lưu</button>
                    <button className="admin-btn" type="button" onClick={() => setSelected(null)}>Hủy</button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}

export default Account;
