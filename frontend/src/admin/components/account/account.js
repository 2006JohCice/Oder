/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import { useEffect, useState } from "react";
import "../../css/user/user.css";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function Account() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState([]);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    phone: "",
    users: "",
    password: "",
    role_id: "",
    status: "inActive",
  });

  const fetchAccounts = () => {
    apiFetch("/api/admin/listAccount")
      .then((res) => setUsers(res.records))
      .catch((err) => {
        if (err.status === 401) navigate("/admin/auth/login");
      });
  };

  const fetchRole = () => {
    apiFetch("/api/admin/listAccount/create")
      .then((res) => setRole(res))
      .catch((err) => {
        if (err.status === 401) navigate("/admin/auth/login");
      });
  };

  useEffect(() => {
    fetchRole();
    fetchAccounts();
  }, []);

  const handleSelect = (user) => {
    setSelected({
      ...user,
      password: "",
    });
    setShowAddUser(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selected?._id) return;

    const res = await fetch(`/api/admin/listAccount/edit/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      notifyApp(data?.message || "Cap nhat tai khoan that bai", "error");
      return;
    }

    notifyApp("Cap nhat tai khoan thanh cong", "success");
    setSelected(null);
    fetchAccounts();
  };

  const handlAddAcount = () => {
    setSelected(null);
    setShowAddUser(true);
  };

  const fetchApiUser = async (e) => {
    e.preventDefault();
    if (newUser.users === newUser.password) {
      notifyApp("Khong nhap mat khau trung voi ten dang nhap", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/listAccount/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          status: "inActive",
        });
        fetchAccounts();
      }
    } catch (err) {
      notifyApp("Loi tao tai khoan", "error");
    }
  };

  return (
    <section
      className="admin-content"
      style={{ gridTemplateColumns: selected || showAddUser ? "2fr 1fr" : "1fr" }}
    >
      <div>
        <div className="admin-card admin-table">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h3>Account management</h3>
            <div className="admin-actions">
              <button className="admin-btn admin-primary" onClick={handlAddAcount}>
                Add Account
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u, index) => (
                <tr key={u._id}>
                  <td>{index + 1}</td>
                  <td>{u.fullname}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.role?.name}</td>
                  <td>{u.status}</td>
                  <td style={{ display: "flex", gap: "5px" }}>
                    <button
                      className={`admin-btn ${activeTab === u._id ? "admin-primary" : ""}`}
                      onClick={() => {
                        handleSelect(u);
                        setActiveTab(u._id);
                      }}
                    >
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
            <h3>Add Account</h3>
            <form className="admin-editor" style={{ display: "grid", gap: "10px" }} onSubmit={fetchApiUser}>
              <input
                className="admin-input"
                required
                placeholder="Ten nguoi dung"
                type="text"
                value={newUser.fullname}
                onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
              />
              <input
                className="admin-input"
                required
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                className="admin-input"
                required
                placeholder="So dien thoai"
                type="number"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
              <input
                className="admin-input"
                required
                placeholder="Username"
                type="text"
                value={newUser.users}
                onChange={(e) => setNewUser({ ...newUser, users: e.target.value })}
              />
              <input
                className="admin-input"
                required
                placeholder="Mat khau"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <select
                className="admin-select"
                value={newUser.role_id}
                onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
              >
                <option value="">Chon vai tro</option>
                {role.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <select
                className="admin-select"
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inActive">Inactive</option>
              </select>
              <button type="submit" className="admin-btn admin-primary">
                Tao tai khoan
              </button>
            </form>
          </section>
        )}

        {selected && (
          <div className="admin-card">
            <h3>Edit Account</h3>
            <form onSubmit={handleSave}>
              <div className="admin-editor" style={{ display: "grid", gap: "10px" }}>
                <input
                  className="admin-input"
                  value={selected.fullname}
                  onChange={(e) => setSelected({ ...selected, fullname: e.target.value })}
                  required
                />
                <input
                  className="admin-input"
                  value={selected.email}
                  onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                  required
                />
                <input
                  className="admin-input"
                  placeholder="Mat khau moi (de trong neu khong doi)"
                  value={selected.password || ""}
                  onChange={(e) => setSelected({ ...selected, password: e.target.value })}
                />
                <select
                  className="admin-select"
                  value={selected.status}
                  onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inActive">Inactive</option>
                </select>
                <div className="admin-form-row">
                  <button className="admin-btn admin-primary" type="submit">
                    Save
                  </button>
                  <button
                    className="admin-btn"
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setActiveTab(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </aside>
    </section>
  );
}

export default Account;
