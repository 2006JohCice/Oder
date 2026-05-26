import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import "../../css/shared/admin-components.css";
import "../../css/user/user.css";

/* ── Helpers ────────────────────────────────────── */
const getInitial = name => (name ? name.charAt(0).toUpperCase() : "?");

/* ── Donut SVG Chart ────────────────────────────── */
const DonutChart = ({ active, inactive, total }) => {
  const SIZE = 130, STROKE = 20, R = (SIZE - STROKE) / 2, CIRC = 2 * Math.PI * R;
  const aD = total > 0 ? (active / total) * CIRC : 0;
  const iD = total > 0 ? (inactive / total) * CIRC : 0;
  return (
    <svg className="adm-donut-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="#e2e8f4" strokeWidth={STROKE} />
      <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="var(--adm-accent)" strokeWidth={STROKE}
        strokeDasharray={`${aD} ${CIRC - aD}`} strokeDashoffset={0}
        transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`} />
      <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="var(--adm-danger)" strokeWidth={STROKE}
        strokeDasharray={`${iD} ${CIRC - iD}`} strokeDashoffset={-aD}
        transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`} />
      <text x={SIZE/2} y={SIZE/2 - 5} textAnchor="middle"
        style={{ fontSize: 22, fontWeight: 700, fill: "var(--adm-text)", fontFamily: "var(--adm-mono)" }}>
        {total}
      </text>
      <text x={SIZE/2} y={SIZE/2 + 14} textAnchor="middle"
        style={{ fontSize: 10, fill: "var(--adm-muted)", fontFamily: "var(--adm-font)" }}>
        người dùng
      </text>
    </svg>
  );
};

/* ── Grouped Bar Chart ──────────────────────────── */
const GroupedBarChart = ({ users }) => {
  const groups = useMemo(() => {
    const map = {};
    users.forEach(u => {
      const k = u.role || "user";
      if (!map[k]) map[k] = { role: k, active: 0, inactive: 0 };
      u.status === "active" ? map[k].active++ : map[k].inactive++;
    });
    return Object.values(map);
  }, [users]);
  const maxVal = groups.reduce((m, g) => Math.max(m, g.active + g.inactive), 1);
  if (!groups.length) return <div style={{ textAlign: "center", color: "var(--adm-muted)", padding: "30px 0", fontSize: 13 }}>Chưa có dữ liệu</div>;
  return (
    <div className="adm-chart-wrap" style={{ alignItems: "flex-end", gap: 18 }}>
      {groups.map((g, i) => (
        <div key={i} className="adm-bar-group">
          <div className="adm-bar-count">{g.active + g.inactive}</div>
          <div className="adm-bar-track">
            <div className="adm-bar-fill adm-bar-fill--green" style={{ height: `${(g.active / maxVal) * 100}%` }} title={`Hoạt động: ${g.active}`} />
            <div className="adm-bar-fill adm-bar-fill--red"   style={{ height: `${(g.inactive / maxVal) * 100}%` }} title={`Khoá: ${g.inactive}`} />
          </div>
          <span className="adm-bar-label">{g.role}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Pagination ─────────────────────────────────── */
const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="adm-pagination">
      <button className="adm-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
        <i className="bi bi-chevron-left" />
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} className={`adm-page-btn ${page === p ? "adm-page-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button className="adm-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
};

/* ── Main ────────────────────────────────────────── */
function UsersAdmin() {
  const navigate = useNavigate();
  const [selected, setSelected]       = useState(null);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCharts, setShowCharts]   = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    let url = "/api/admin/userAdmin";
    const params = [];
    if (page > 1)    params.push(`page=${page}`);
    if (statusFilter) params.push(`status=${statusFilter}`);
    if (params.length) url += "?" + params.join("&");

    apiFetch(url)
      .then(res => {
        setUsers(res.data || []);
        setTotalPages(res.objPagination?.totalPages || 1);
      })
      .catch(err => { if (err.status === 401) navigate("/admin/auth/login"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, statusFilter]);

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.status === "active").length,
    inactive: users.filter(u => u.status !== "active").length,
    roles:    [...new Set(users.map(u => u.role || "user"))].length,
  }), [users]);

  const handleSave = async () => {
    const res = await fetch(`/api/admin/userAdmin/edit/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(selected),
    });
    const data = await res.json();
    if (!res.ok) { notifyApp(data.message || "Cập nhật thất bại", "error"); return; }
    notifyApp(data.message || "Cập nhật thành công", "success");
    setSelected(null);
    fetchUsers();
  };

  const handleDelete = async id => {
    if (!window.confirm("Xác nhận xoá người dùng này?")) return;
    const res = await fetch(`/api/admin/userAdmin/delete/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (!res.ok) { notifyApp(data.message || "Xóa thất bại", "error"); return; }
    notifyApp(data.message || "Xóa thành công", "success");
    fetchUsers();
  };

  return (
    <div className="adm-page">

      {/* ── Page Header ── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-people" style={{ color: "var(--adm-info)", marginRight: 8 }} />
            Quản lý người dùng
          </h1>
          <p className="adm-page-sub">Quản lý tài khoản và phân quyền người dùng hệ thống</p>
        </div>
        <button
          className="adm-btn adm-btn--ghost"
          onClick={() => setShowCharts(c => !c)}
        >
          <i className={`bi bi-bar-chart${showCharts ? "-fill" : ""}`} />
          {showCharts ? "Ẩn biểu đồ" : "Thống kê"}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <section className="adm-stats">
        <div className="adm-stat-card adm-stat-card--blue">
          <div className="adm-stat-icon"><i className="bi bi-people" /></div>
          <span className="adm-stat-label">Tổng người dùng</span>
          <span className="adm-stat-value">{stats.total}</span>
          <span className="adm-stat-sub">tất cả tài khoản</span>
        </div>
        <div className="adm-stat-card adm-stat-card--green">
          <div className="adm-stat-icon"><i className="bi bi-person-check" /></div>
          <span className="adm-stat-label">Hoạt động</span>
          <span className="adm-stat-value">{stats.active}</span>
          <span className="adm-stat-sub">đang có quyền truy cập</span>
        </div>
        <div className="adm-stat-card adm-stat-card--red">
          <div className="adm-stat-icon"><i className="bi bi-person-slash" /></div>
          <span className="adm-stat-label">Tạm khoá</span>
          <span className="adm-stat-value">{stats.inactive}</span>
          <span className="adm-stat-sub">bị hạn chế truy cập</span>
        </div>
        <div className="adm-stat-card adm-stat-card--purple">
          <div className="adm-stat-icon"><i className="bi bi-shield-half" /></div>
          <span className="adm-stat-label">Nhóm vai trò</span>
          <span className="adm-stat-value">{stats.roles}</span>
          <span className="adm-stat-sub">loại quyền khác nhau</span>
        </div>
      </section>

      {/* ── Charts (toggleable) ── */}
      {showCharts && users.length > 0 && (
        <div className="adm-grid-2" style={{ marginBottom: 14 }}>
          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">
                <i className="bi bi-bar-chart-grouped" /> Hoạt động theo vai trò
              </span>
            </div>
            <div className="adm-card-body">
              <GroupedBarChart users={users} />
              <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12, color: "var(--adm-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--adm-accent)", display: "inline-block" }} /> Hoạt động
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--adm-danger)", display: "inline-block" }} /> Tạm khoá
                </span>
              </div>
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-header">
              <span className="adm-card-title">
                <i className="bi bi-pie-chart" /> Tổng quan tài khoản
              </span>
            </div>
            <div className="adm-card-body">
              <div className="adm-donut-wrap">
                <DonutChart active={stats.active} inactive={stats.inactive} total={stats.total} />
                <div className="adm-donut-legend">
                  <div className="adm-legend-row">
                    <span className="adm-legend-left">
                      <span className="adm-legend-dot" style={{ background: "var(--adm-accent)" }} />
                      Hoạt động
                    </span>
                    <span className="adm-legend-val">{stats.active}</span>
                  </div>
                  <div className="adm-legend-row">
                    <span className="adm-legend-left">
                      <span className="adm-legend-dot" style={{ background: "var(--adm-danger)" }} />
                      Tạm khoá
                    </span>
                    <span className="adm-legend-val">{stats.inactive}</span>
                  </div>
                  <div className="adm-legend-row" style={{ borderTop: "1px solid var(--adm-border)", paddingTop: 8, marginTop: 4 }}>
                    <span className="adm-legend-left">
                      <span className="adm-legend-dot" style={{ background: "var(--adm-border)" }} />
                      Tổng
                    </span>
                    <span className="adm-legend-val">{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Table + Edit Panel ── */}
      <div className={`uad-main ${selected ? "uad-main--split" : "uad-main--full"}`}>

        {/* Table Card */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">
              <i className="bi bi-people" style={{ color: "var(--adm-accent)" }} />
              Danh sách người dùng
              <span className="adm-badge adm-badge--info" style={{ marginLeft: 8 }}>{users.length} người</span>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="adm-select" value={statusFilter}
                onChange={e => { setPage(1); setStatusFilter(e.target.value); }}>
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khoá</option>
              </select>
            </div>
          </div>

          <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th className="adm-th-center">Trạng thái</th>
                  <th className="adm-th-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="adm-loading-row">
                    <td colSpan="5">
                      <div className="adm-spinner" />
                      <div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải...</div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="adm-empty">
                        <div className="adm-empty-icon"><i className="bi bi-inbox" /></div>
                        <div className="adm-empty-text">Không tìm thấy người dùng nào</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u._id} className={selected?._id === u._id ? "adm-row--selected" : ""}>
                      <td className="adm-row-idx">{i + 1}</td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="adm-avatar">{getInitial(u.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--adm-text)" }}>{u.name || "—"}</div>
                            <div style={{ fontSize: 12, color: "var(--adm-muted)" }}>{u.email || "—"}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="adm-badge adm-badge--purple">
                          <i className="bi bi-shield-half" /> {u.role || "user"}
                        </span>
                      </td>

                      <td className="adm-td-center">
                        <span className={`adm-badge adm-badge--${u.status === "active" ? "active" : "inactive"}`}>
                          <i className={`bi bi-${u.status === "active" ? "check-circle" : "slash-circle"}`} />
                          {u.status === "active" ? "Hoạt động" : "Tạm khoá"}
                        </span>
                      </td>

                      <td className="adm-td-center">
                        <div className="adm-actions" style={{ justifyContent: "center" }}>
                          <button className="adm-btn adm-btn--edit adm-btn--icon"
                            onClick={() => setSelected({ ...u })} title="Chỉnh sửa">
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="adm-btn adm-btn--danger adm-btn--icon"
                            onClick={() => handleDelete(u._id)} title="Xoá">
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>

        {/* ── Edit Panel ── */}
        {selected && (
          <div className="uad-panel">
            <div className="uad-panel-header">
              <span className="adm-card-title">
                <i className="bi bi-pencil-square" /> Chỉnh sửa
              </span>
              <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={() => setSelected(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="uad-panel-avatar-row">
              <div className="adm-avatar" style={{ width: 54, height: 54, fontSize: 22 }}>
                {getInitial(selected.name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--adm-text)" }}>{selected.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--adm-muted)" }}>{selected.email}</div>
              </div>
            </div>

            <div style={{ padding: "0 18px 18px" }}>
              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-person" /> Tên người dùng</label>
                <input className="adm-form-input" value={selected.name || ""}
                  onChange={e => setSelected({ ...selected, name: e.target.value })} placeholder="Nhập tên..." />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-envelope" /> Email</label>
                <input className="adm-form-input" value={selected.email || ""}
                  onChange={e => setSelected({ ...selected, email: e.target.value })} placeholder="Nhập email..." />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-shield-half" /> Vai trò</label>
                <input className="adm-form-input" value={selected.role || ""}
                  onChange={e => setSelected({ ...selected, role: e.target.value })} placeholder="admin, user..." />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label"><i className="bi bi-toggle-on" /> Trạng thái</label>
                <select className="adm-form-select" value={selected.status || "active"}
                  onChange={e => setSelected({ ...selected, status: e.target.value })}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm khoá</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button className="adm-btn adm-btn--save" style={{ flex: 1 }} onClick={handleSave}>
                  <i className="bi bi-floppy" /> Lưu thay đổi
                </button>
                <button className="adm-btn adm-btn--ghost" onClick={() => setSelected(null)}>
                  <i className="bi bi-x" /> Huỷ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersAdmin;