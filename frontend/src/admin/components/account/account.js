import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import "../../css/shared/admin-components.css";

function Account() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState({
    fullname: "", email: "", phone: "", users: "", password: "", role_id: "", status: "active",
  });

  const fetchAccounts = () => {
    setLoading(true);
    apiFetch("/api/admin/listAccount")
      .then((res) => { setUsers(res.records || []); setLoading(false); })
      .catch((err) => { if (err.status === 401) navigate("/admin/auth/login"); });
  };

  const fetchRole = () => {
    apiFetch("/api/admin/listAccount/create")
      .then((res) => setRole(Array.isArray(res) ? res : []))
      .catch((err) => { if (err.status === 401) navigate("/admin/auth/login"); });
  };

  useEffect(() => { fetchRole(); fetchAccounts(); }, []);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inActive").length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    );
  }, [users, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/listAccount/edit/${selected._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(selected),
    });
    const data = await res.json();
    if (!res.ok || !data.success) { notifyApp(data?.message || "Cập nhật thất bại", "error"); return; }
    notifyApp("Cập nhật tài khoản thành công", "success");
    setSelected(null); fetchAccounts();
  };

  const fetchApiUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/listAccount/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(newUser),
      });
      const data = await res.json();
      notifyApp(data.message, res.ok ? "success" : "error");
      if (res.ok) {
        setShowAddUser(false);
        setNewUser({ fullname: "", email: "", phone: "", users: "", password: "", role_id: "", status: "active" });
        fetchAccounts();
      }
    } catch (err) { notifyApp("Lỗi tạo tài khoản", "error"); }
  };

  const getInitial = name => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div className="adm-page">

      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-person-badge" style={{ color: "var(--adm-accent)", marginRight: 8 }} />
            Quản trị tài khoản
          </h1>
          <p className="adm-page-sub">Quản lý tài khoản admin, nhân viên quản trị và phân quyền hệ thống</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setSelected(null); setShowAddUser(true); }}>
          <i className="bi bi-plus-lg" /> Thêm tài khoản
        </button>
      </div>

      {/* Stats */}
      <section className="adm-stats">
        <div className="adm-stat-card adm-stat-card--blue">
          <div className="adm-stat-icon"><i className="bi bi-people" /></div>
          <span className="adm-stat-label">Tổng tài khoản</span>
          <span className="adm-stat-value">{stats.total}</span>
        </div>
        <div className="adm-stat-card adm-stat-card--green">
          <div className="adm-stat-icon"><i className="bi bi-person-check" /></div>
          <span className="adm-stat-label">Đang hoạt động</span>
          <span className="adm-stat-value">{stats.active}</span>
        </div>
        <div className="adm-stat-card adm-stat-card--red">
          <div className="adm-stat-icon"><i className="bi bi-person-slash" /></div>
          <span className="adm-stat-label">Tạm khóa</span>
          <span className="adm-stat-value">{stats.inactive}</span>
        </div>
      </section>

      {/* Main Layout */}
      <div className={`uad-main ${(selected || showAddUser) ? "uad-main--split" : "uad-main--full"}`}>

        {/* List Card */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title"><i className="bi bi-list-ul" /> Danh sách quản trị viên</span>
            <input type="text" className="adm-form-input" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 250, padding: "6px 12px" }} />
          </div>

          <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Họ tên</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th className="adm-th-center">Trạng thái</th>
                  <th className="adm-th-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="adm-loading-row"><td colSpan="6"><div className="adm-spinner" /><div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải...</div></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="6"><div className="adm-empty"><div className="adm-empty-icon"><i className="bi bi-inbox" /></div><div className="adm-empty-text">Không tìm thấy tài khoản nào</div></div></td></tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <tr key={u._id} className={selected?._id === u._id ? "adm-row--selected" : ""}>
                      <td className="adm-row-idx">{i + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="adm-avatar">{getInitial(u.fullname)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--adm-text)" }}>{u.fullname}</div>
                            <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>@{u.users}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5 }}><i className="bi bi-envelope" /> {u.email}</div>
                        <div style={{ fontSize: 12, color: "var(--adm-muted)" }}><i className="bi bi-telephone" /> {u.phone || "—"}</div>
                      </td>
                      <td><span className="adm-badge adm-badge--purple"><i className="bi bi-shield-half" /> {u.role?.name || "N/A"}</span></td>
                      <td className="adm-td-center">
                        <span className={`adm-badge adm-badge--${u.status === "active" ? "active" : "inactive"}`}>
                          <i className={`bi bi-${u.status === "active" ? "check-circle" : "slash-circle"}`} /> {u.status === "active" ? "Hoạt động" : "Tạm khóa"}
                        </span>
                      </td>
                      <td className="adm-td-center">
                        <button className="adm-btn adm-btn--edit adm-btn--icon" onClick={() => { setSelected({ ...u, password: "" }); setShowAddUser(false); }}>
                          <i className="bi bi-pencil" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        {(selected || showAddUser) && (
          <div className="uad-panel">
            <div className="uad-panel-header">
              <span className="adm-card-title">
                {showAddUser ? <><i className="bi bi-person-plus" /> Thêm tài khoản mới</> : <><i className="bi bi-pencil-square" /> Chỉnh sửa tài khoản</>}
              </span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => { setSelected(null); setShowAddUser(false); }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div style={{ padding: 18 }}>
              <form onSubmit={showAddUser ? fetchApiUser : handleSave}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Họ và tên</label>
                  <input className="adm-form-input" required value={showAddUser ? newUser.fullname : selected.fullname} onChange={e => showAddUser ? setNewUser({ ...newUser, fullname: e.target.value }) : setSelected({ ...selected, fullname: e.target.value })} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Email</label>
                  <input type="email" className="adm-form-input" required value={showAddUser ? newUser.email : selected.email} onChange={e => showAddUser ? setNewUser({ ...newUser, email: e.target.value }) : setSelected({ ...selected, email: e.target.value })} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Số điện thoại</label>
                  <input className="adm-form-input" value={showAddUser ? newUser.phone : (selected.phone || "")} onChange={e => showAddUser ? setNewUser({ ...newUser, phone: e.target.value }) : setSelected({ ...selected, phone: e.target.value })} />
                </div>
                {showAddUser && (
                  <div className="adm-form-group">
                    <label className="adm-form-label">Tên đăng nhập</label>
                    <input className="adm-form-input" required value={newUser.users} onChange={e => setNewUser({ ...newUser, users: e.target.value })} />
                  </div>
                )}
                <div className="adm-form-group">
                  <label className="adm-form-label">{showAddUser ? "Mật khẩu" : "Mật khẩu mới (để trống nếu không đổi)"}</label>
                  <input type="password" className="adm-form-input" required={showAddUser} value={showAddUser ? newUser.password : (selected.password || "")} onChange={e => showAddUser ? setNewUser({ ...newUser, password: e.target.value }) : setSelected({ ...selected, password: e.target.value })} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Vai trò</label>
                  <select className="adm-form-select" required value={showAddUser ? newUser.role_id : selected.role_id} onChange={e => showAddUser ? setNewUser({ ...newUser, role_id: e.target.value }) : setSelected({ ...selected, role_id: e.target.value })}>
                    <option value="">Chọn vai trò</option>
                    {role.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Trạng thái</label>
                  <select className="adm-form-select" value={showAddUser ? newUser.status : selected.status} onChange={e => showAddUser ? setNewUser({ ...newUser, status: e.target.value }) : setSelected({ ...selected, status: e.target.value })}>
                    <option value="active">Hoạt động</option>
                    <option value="inActive">Tạm khóa</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button type="submit" className="adm-btn adm-btn--primary" style={{ flex: 1 }}>
                    {showAddUser ? <><i className="bi bi-person-plus" /> Tạo tài khoản</> : <><i className="bi bi-floppy" /> Lưu thay đổi</>}
                  </button>
                  <button type="button" className="adm-btn adm-btn--ghost" onClick={() => { setSelected(null); setShowAddUser(false); }}>
                    <i className="bi bi-x" /> Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;