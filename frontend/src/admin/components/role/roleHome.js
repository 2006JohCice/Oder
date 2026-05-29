import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import {confirmApp} from "../../../shared/notifications/ConfirmProvider";

import "../../css/shared/admin-components.css";

/* ── Donut Chart ─────────────────────────────────── */
const DONUT_FILLS = ["#1ABB9C", "#3498DB", "#E74C3C", "#F39C12", "#9B59B6", "#0EA5E9"];
const DonutChart = ({ data, total }) => {
  const SIZE = 140, STROKE = 22, R = (SIZE - STROKE) / 2, CIRC = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg className="adm-donut-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="#e2e8f4" strokeWidth={STROKE} />
      {data.map((d, i) => {
        const dash = total > 0 ? (d.count / total) * CIRC : 0;
        const el = (
          <circle key={i} cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
            stroke={DONUT_FILLS[i % DONUT_FILLS.length]} strokeWidth={STROKE}
            strokeDasharray={`${dash} ${CIRC - dash}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`} />
        );
        offset += dash;
        return el;
      })}
      <text x={SIZE/2} y={SIZE/2 - 6} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: "var(--adm-text)", fontFamily: "var(--adm-mono)" }}>{total}</text>
      <text x={SIZE/2} y={SIZE/2 + 14} textAnchor="middle" style={{ fontSize: 10, fill: "var(--adm-muted)" }}>vai trò</text>
    </svg>
  );
};

/* ── Bar Chart ───────────────────────────────────── */
const BAR_COLORS = ["green", "blue", "red", "orange", "purple", "sky"];
const BarChart = ({ data, maxVal }) => (
  <div className="adm-chart-wrap" style={{ height: 160 }}>
    {data.map((d, i) => (
      <div key={i} className="adm-bar-group">
        <span className="adm-bar-count">{d.count}</span>
        <div className="adm-bar-track">
          <div className={`adm-bar-fill adm-bar-fill--${BAR_COLORS[i % BAR_COLORS.length]}`}
               style={{ height: `${Math.max(maxVal > 0 ? (d.count / maxVal) * 100 : 0, 2)}%` }} />
        </div>
        <span className="adm-bar-label" title={d.name}>{d.name}</span>
      </div>
    ))}
  </div>
);

/* ── Main ────────────────────────────────────────── */
const RoleHome = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    apiFetch("/api/admin/role")
      .then(roles => setData(Array.isArray(roles) ? roles : []))
      .catch(err => { if (err.status === 401) navigate("/admin/auth/login"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!(await confirmApp("Xác nhận", "Xác nhận xoá vai trò này?"))) return;
    try {
      const res = await fetch(`/api/admin/role/delete/${id}`, { method: "DELETE", credentials: "include" });
      const payload = await res.json();
      if (!res.ok) { notifyApp(payload.message || "Xóa thất bại", "error"); return; }
      notifyApp(payload.message || "Xóa thành công", "success");
      fetchData();
    } catch { notifyApp("Lỗi khi xóa", "error"); }
  };

  const totalRoles       = data.length;
  const totalPermissions = useMemo(() => data.reduce((s, r) => s + (Array.isArray(r.permissions) ? r.permissions.length : 0), 0), [data]);
  const maxPerms         = useMemo(() => data.reduce((m, r) => Math.max(m, Array.isArray(r.permissions) ? r.permissions.length : 0), 0), [data]);
  const avgPerms         = totalRoles > 0 ? (totalPermissions / totalRoles).toFixed(1) : 0;
  const chartData        = useMemo(() => data.map(r => ({ name: r.name, count: Array.isArray(r.permissions) ? r.permissions.length : 0 })), [data]);

  return (
    <div className="adm-page">

      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-shield-lock" style={{ color: "var(--adm-purple)", marginRight: 8 }} />
            Vai trò & Phân quyền
          </h1>
          <p className="adm-page-sub">Quản lý nhóm quyền dùng cho toàn bộ hệ thống admin</p>
        </div>
        <Link to="/admin/role/create" className="adm-btn adm-btn--primary">
          <i className="bi bi-plus-lg" /> Thêm vai trò
        </Link>
      </div>

      {/* Stats */}
      <section className="adm-stats">
        <div className="adm-stat-card adm-stat-card--purple">
          <div className="adm-stat-icon"><i className="bi bi-shield-check" /></div>
          <span className="adm-stat-label">Tổng vai trò</span>
          <span className="adm-stat-value">{totalRoles}</span>
          <span className="adm-stat-sub">nhóm phân quyền</span>
        </div>
        <div className="adm-stat-card adm-stat-card--green">
          <div className="adm-stat-icon"><i className="bi bi-key" /></div>
          <span className="adm-stat-label">Tổng quyền</span>
          <span className="adm-stat-value">{totalPermissions}</span>
          <span className="adm-stat-sub">trên tất cả vai trò</span>
        </div>
        <div className="adm-stat-card adm-stat-card--yellow">
          <div className="adm-stat-icon"><i className="bi bi-bar-chart" /></div>
          <span className="adm-stat-label">Trung bình</span>
          <span className="adm-stat-value">{avgPerms}</span>
          <span className="adm-stat-sub">quyền mỗi nhóm</span>
        </div>
        <div className="adm-stat-card adm-stat-card--sky">
          <div className="adm-stat-icon"><i className="bi bi-trophy" /></div>
          <span className="adm-stat-label">Cao nhất</span>
          <span className="adm-stat-value">{maxPerms}</span>
          <span className="adm-stat-sub">quyền nhiều nhất</span>
        </div>
      </section>

      {/* Charts */}
      {data.length > 0 && (
        <div className="adm-grid-2">
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title"><i className="bi bi-bar-chart-line" /> Mức độ phân quyền</span></div>
            <div className="adm-card-body"><BarChart data={chartData} maxVal={maxPerms || 1} /></div>
          </div>
          <div className="adm-card">
            <div className="adm-card-header"><span className="adm-card-title"><i className="bi bi-pie-chart" /> Tỷ trọng quyền</span></div>
            <div className="adm-card-body">
              <div className="adm-donut-wrap">
                <DonutChart data={chartData} total={totalRoles} />
                <div className="adm-donut-legend">
                  {chartData.map((d, i) => (
                    <div key={i} className="adm-legend-row">
                      <span className="adm-legend-left">
                        <span className="adm-legend-dot" style={{ background: DONUT_FILLS[i % DONUT_FILLS.length] }} />
                        {d.name}
                      </span>
                      <span className="adm-legend-val">{d.count} <span style={{ fontWeight: 400, fontSize: 11, color: "var(--adm-muted)" }}>quyền</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title"><i className="bi bi-shield-half" /> Danh sách vai trò</span>
        </div>
        <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>STT</th>
                <th>Tên vai trò</th>
                <th>Mô tả</th>
                <th className="adm-th-center">Số quyền</th>
                <th>Mức độ truy cập</th>
                <th className="adm-th-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="adm-loading-row"><td colSpan="6"><div className="adm-spinner" /><div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải...</div></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="6"><div className="adm-empty"><div className="adm-empty-icon"><i className="bi bi-shield-x" /></div><div>Chưa có vai trò nào</div></div></td></tr>
              ) : (
                data.map((item, i) => {
                  const permCount = Array.isArray(item.permissions) ? item.permissions.length : 0;
                  const pct = maxPerms > 0 ? (permCount / maxPerms) * 100 : 0;
                  return (
                    <tr key={item._id}>
                      <td className="adm-row-idx">{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--adm-text)" }}>
                          <i className="bi bi-shield-half" style={{ color: "var(--adm-purple)", marginRight: 6 }} />
                          {item.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, color: "var(--adm-muted)" }}>{item.description || "—"}</div>
                      </td>
                      <td className="adm-td-center">
                        <span className="adm-badge adm-badge--grey"><i className="bi bi-key" /> {permCount}</span>
                      </td>
                      <td style={{ minWidth: 180 }}>
                        <div className="adm-prog-bar">
                          <div className="adm-prog-track"><div className="adm-prog-fill" style={{ width: `${pct}%` }} /></div>
                          <span className="adm-prog-pct">{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td className="adm-td-center">
                        <div className="adm-actions" style={{ justifyContent: "center" }}>
                          <Link to={`/admin/role/edit/${item._id}`} className="adm-btn adm-btn--edit adm-btn--icon" title="Chỉnh sửa">
                            <i className="bi bi-pencil" />
                          </Link>
                          <button className="adm-btn adm-btn--danger adm-btn--icon" onClick={() => handleDelete(item._id)} title="Xoá">
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleHome;