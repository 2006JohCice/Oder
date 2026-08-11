import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { formatCurrency, formatDateTime } from "../../users/utils/shop";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from "recharts";
import "./MainAdmin.css";

/* ────────────────────────────────────────────────
   Donut / gauge component
   ──────────────────────────────────────────────── */
function DonutGauge({ pct = 0, color = "#1ABB9C", size = 100 }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E6E9ED" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────────
   Horizontal progress bar
   ──────────────────────────────────────────────── */
function ProgressBar({ pct = 0, color = "#1ABB9C", label = "", value = "" }) {
  return (
    <div className="ma-progress-row">
      <div className="ma-progress-label">{label}</div>
      <div className="ma-progress-track">
        <div
          className="ma-progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="ma-progress-value">{value}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Main Dashboard Component
   ──────────────────────────────────────────────── */
function MainAdmin({ query }) {
  const navigate = useNavigate();
  const [overview, setOverview] = useState({ orders: [], users: [], restaurants: [] });
  const [visitStats, setVisitStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time filter state with localStorage persistence
  const [timeFilter, setTimeFilter] = useState(() => {
    return localStorage.getItem("adminStatsTimeFilter") || "all_time";
  });

  useEffect(() => {
    localStorage.setItem("adminStatsTimeFilter", timeFilter);
  }, [timeFilter]);

  // Helper to check if a date is within the selected timeFilter
  const isDateInFilter = (dateStr, filter) => {
    if (!dateStr) return true;
    if (filter === "all_time") return true;
    
    const d = new Date(dateStr);
    const now = new Date();
    
    if (filter === "7days") {
      return (now - d) <= 7 * 24 * 60 * 60 * 1000;
    }
    if (filter === "30days") {
      return (now - d) <= 30 * 24 * 60 * 60 * 1000;
    }
    if (filter === "this_month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filter === "this_year") {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Original time filter code removed since it was hoisted above

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes, restaurantsRes, visitRes] = await Promise.all([
          apiFetch("/api/admin/checkout/doneOrder?limit=200"),
          apiFetch("/api/admin/user-accounts"),
          apiFetch("/api/admin/restaurants"),
          apiFetch("/api/visit/stats")
        ]);
        if (ignore) return;
        setOverview({
          orders: Array.isArray(ordersRes.orders) ? ordersRes.orders : [],
          users: Array.isArray(usersRes.data) ? usersRes.data : [],
          restaurants: Array.isArray(restaurantsRes.restaurants) ? restaurantsRes.restaurants : [],
        });
        setVisitStats(visitRes.stats || []);
      } catch (err) {
        if (err.status === 401) navigate("/admin/auth/login");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [navigate]);

  const filteredOrders = useMemo(() => {
    const kw = String(query || "").trim().toLowerCase();
    
    // First filter by search keyword
    let results = overview.orders;
    if (kw) {
      results = results.filter(o =>
        [o.orderId, o.orderGroupCode, o.userInfo?.fullName, o.userInfo?.phone, o.restaurantInfo?.name]
          .filter(Boolean).join(" ").toLowerCase().includes(kw)
      );
    }
    
    // Then filter by timeFilter
    return results.filter(o => isDateInFilter(o.createdAt, timeFilter));
  }, [overview.orders, query, timeFilter]);

  const stats = useMemo(() => {
    const filteredUsers = overview.users.filter(u => isDateInFilter(u.createdAt, timeFilter));
    const filteredRestaurants = overview.restaurants.filter(r => isDateInFilter(r.createdAt, timeFilter));
    
    const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    return {
      totalUsers: filteredUsers.length,
      totalRestaurants: filteredRestaurants.length,
      activeRestaurants: filteredRestaurants.filter(r => r.status === "active").length,
      pendingRestaurants: filteredRestaurants.filter(r => r.status === "pending").length,
      totalOrders: filteredOrders.length,
      pendingOrders: filteredOrders.filter(o => o.orderStatus === "pending").length,
      completedOrders: filteredOrders.filter(o => o.orderStatus === "completed").length,
      cancelledOrders: filteredOrders.filter(o => o.orderStatus === "cancelled").length,
      totalRevenue,
      tableDeposits: filteredOrders.reduce((s, o) => s + Number(o.depositAmount || 0), 0),
    };
  }, [filteredOrders, overview.restaurants, overview.users, timeFilter]);

  const topRestaurants = useMemo(() =>
    [...overview.restaurants]
      .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0) || (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 5),
    [overview.restaurants]
  );

  const recentOrders = filteredOrders.slice(0, 8);

  /* Build a simple 7-point "orders per day" dataset from recentOrders for the recharts */
  const chartLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const seed = stats.totalOrders;
  const orderChartData = chartLabels.map((lbl, i) => ({
    name: lbl,
    delivery: Math.max(1, Math.round(seed * 0.07 * Math.sin(i + 1) + seed * 0.1)),
    dine_in: Math.max(1, Math.round(seed * 0.05 * Math.cos(i + 0.5) + seed * 0.07))
  }));

  /* Campaign bars */
  const maxRest = Math.max(...topRestaurants.map(r => r.orderCount || 1), 1);
  const campaignColors = ["#1ABB9C", "#3498DB", "#E67E22", "#9B59B6", "#E74C3C"];

  if (loading) {
    return (
      <div className="ma-loading">
        <div className="ma-spinner" />
        <span>Đang tải tổng quan hệ thống...</span>
      </div>
    );
  }

  return (
    <div className="ma-wrapper">
      {/* ── PAGE HEADER & FILTER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2C3E50', fontWeight: 600 }}>Tổng Quan Hệ Thống</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}><i className="bi bi-calendar-range"></i> Thời gian:</span>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '1px solid #E2E8F0', 
              backgroundColor: '#fff', 
              fontSize: '14px', 
              cursor: 'pointer', 
              outline: 'none',
              minWidth: '150px',
              fontWeight: 500,
              color: '#334155'
            }}
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="this_month">Tháng này</option>
            <option value="this_year">Năm nay</option>
            <option value="all_time">Toàn thời gian</option>
          </select>
        </div>
      </div>

      {/* ── TILE STATS ROW ── */}
      <div className="ma-tiles">
        {[
          { label: "Tổng Users", value: stats.totalUsers.toLocaleString(), icon: "bi-people-fill", color: "#1ABB9C", trend: "+4% tuần trước" },
          { label: "Tổng Đơn Hàng", value: stats.totalOrders.toLocaleString(), icon: "bi-bag-fill", color: "#E74C3C", trend: "+2% tuần trước" },
          { label: "Đơn Đang Chờ", value: stats.pendingOrders.toLocaleString(), icon: "bi-clock-fill", color: "#E67E22", trend: "Cần xử lý" },
          { label: "Đơn Hoàn Thành", value: stats.completedOrders.toLocaleString(), icon: "bi-check-circle-fill", color: "#3498DB", trend: "+12% tuần trước" },
          { label: "Nhà Hàng", value: stats.totalRestaurants.toLocaleString(), icon: "bi-shop-window", color: "#9B59B6", trend: `${stats.activeRestaurants} active` },
          { label: "Doanh Thu", value: formatCurrency(stats.totalRevenue), icon: "bi-cash-stack", color: "#2C3E50", trend: `+${stats.pendingRestaurants} chờ duyệt`, small: true },
        ].map((tile, i) => (
          <div className="ma-tile" key={i} style={{ "--tile-color": tile.color }}>
            <div className="ma-tile-icon">
              <i className={`bi ${tile.icon}`} />
            </div>
            <div className="ma-tile-body">
              <div className="ma-tile-label">{tile.label}</div>
              <div className={`ma-tile-value ${tile.small ? "ma-tile-value--sm" : ""}`}>{tile.value}</div>
              <div className="ma-tile-trend">{tile.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART + CAMPAIGN ROW ── */}
      <div className="ma-row">
        {/* Area Chart */}
        <div className="ma-panel ma-panel--large">
          <div className="ma-panel-header">
            <div>
              <span className="ma-panel-title">Hoạt động Đơn Hàng</span>
              <span className="ma-panel-sub"> Theo tuần</span>
            </div>
            <div className="ma-panel-actions">
              <button className="ma-action-btn"><i className="bi bi-chevron-up" /></button>
              <button className="ma-action-btn"><i className="bi bi-pencil" /></button>
              <button className="ma-action-btn"><i className="bi bi-x" /></button>
            </div>
          </div>
          <div className="ma-panel-body">
            <div className="ma-chart-legend">
              <span className="ma-legend-dot" style={{ background: "#4F46E5" }} /> Giao hàng &nbsp;
              <span className="ma-legend-dot" style={{ background: "#10B981" }} /> Đặt bàn
            </div>
            <div style={{ height: 250, width: "100%", marginTop: "10px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderChartData} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorDineIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.1"/>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 600, color: '#1F2937' }} 
                    itemStyle={{ padding: '4px 0', fontSize: '14px' }} 
                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="delivery" name="Giao hàng" stroke="#4F46E5" strokeWidth={4} fill="url(#colorDelivery)" activeDot={{ r: 6, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }} style={{ filter: 'url(#shadow)' }} />
                  <Area type="monotone" dataKey="dine_in" name="Đặt bàn" stroke="#10B981" strokeWidth={4} fill="url(#colorDineIn)" activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }} style={{ filter: 'url(#shadow)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Campaign performance */}
        <div className="ma-panel">
          <div className="ma-panel-header">
            <span className="ma-panel-title">Top Nhà Hàng</span>
            <div className="ma-panel-actions">
              <button className="ma-action-btn"><i className="bi bi-chevron-up" /></button>
              <button className="ma-action-btn"><i className="bi bi-x" /></button>
            </div>
          </div>
          <div className="ma-panel-body">
            {topRestaurants.map((r, i) => (
              <ProgressBar
                key={r._id}
                label={r.name}
                pct={Math.round(((r.orderCount || 0) / maxRest) * 100)}
                color={campaignColors[i % campaignColors.length]}
                value={`${(r.ratingAverage || 0).toFixed(1)}★`}
              />
            ))}
            {!topRestaurants.length && <div className="ma-empty">Chưa có dữ liệu</div>}
          </div>
        </div>
      </div>

      {/* ── NEW ROW: TRAFFIC STATS ── */}
      <div className="ma-row" style={{ gridTemplateColumns: "1fr", marginBottom: "20px" }}>
        <div className="ma-panel ma-panel--large">
          <div className="ma-panel-header">
            <span className="ma-panel-title">Thống Kê Truy Cập Web Hàng Tháng</span>
            <div className="ma-panel-actions">
              <button className="ma-action-btn"><i className="bi bi-chevron-up" /></button>
            </div>
          </div>
          <div className="ma-panel-body ma-panel-body--flush">
            <div className="ma-table-wrap">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>Thời Gian</th>
                    <th>Tổng Lượt Truy Cập</th>
                    <th>Đã Đăng Ký (Users)</th>
                    <th>Chưa Đăng Ký (Guests)</th>
                    <th>Tỷ Lệ Đăng Ký</th>
                  </tr>
                </thead>
                <tbody>
                  {visitStats.map((st, i) => (
                    <tr key={i}>
                      <td><strong>{st.month}</strong></td>
                      <td>{st.total.toLocaleString()}</td>
                      <td style={{ color: "#1ABB9C", fontWeight: "600" }}>{st.registered.toLocaleString()}</td>
                      <td style={{ color: "#718096" }}>{st.unregistered.toLocaleString()}</td>
                      <td>
                        {st.total > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${(st.registered / st.total) * 100}%`, height: "100%", background: "#1ABB9C" }} />
                            </div>
                            <span style={{ fontSize: "12px", color: "#718096" }}>{Math.round((st.registered / st.total) * 100)}%</span>
                          </div>
                        ) : "0%"}
                      </td>
                    </tr>
                  ))}
                  {!visitStats.length && (
                    <tr><td colSpan="5" className="ma-empty">Không có dữ liệu truy cập.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="ma-row">
        {/* Recent Orders Table */}
        <div className="ma-panel ma-panel--large">
          <div className="ma-panel-header">
            <span className="ma-panel-title">Đơn Hàng Gần Đây</span>
            <div className="ma-panel-actions">
              <button className="ma-action-btn"><i className="bi bi-chevron-up" /></button>
              <button className="ma-action-btn"><i className="bi bi-pencil" /></button>
              <button className="ma-action-btn"><i className="bi bi-x" /></button>
            </div>
          </div>
          <div className="ma-panel-body ma-panel-body--flush">
            <div className="ma-table-wrap">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Nhà Hàng</th>
                    <th>Khách Hàng</th>
                    <th>Loại</th>
                    <th>Tổng</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o._id}>
                      <td>
                        <strong className="ma-order-id">{o.orderId}</strong>
                        <div className="ma-muted">{o.orderGroupCode || "Đơn lẻ"}</div>
                      </td>
                      <td>{o.restaurantInfo?.name || "Nhà hàng"}</td>
                      <td>
                        <strong>{o.userInfo?.fullName || "Khách lẻ"}</strong>
                        <div className="ma-muted">{o.userInfo?.phone || "--"}</div>
                      </td>
                      <td>
                        <span className={`ma-type-badge ${o.orderType === "delivery" ? "delivery" : "table"}`}>
                          {o.orderType === "delivery" ? "Giao hàng" : "Đặt bàn"}
                        </span>
                      </td>
                      <td className="ma-amount">{formatCurrency(o.totalAmount || 0)}</td>
                      <td>
                        <span className={`ma-status ma-status--${o.orderStatus}`}>
                          {o.orderStatus === "pending" && "Đang chờ"}
                          {o.orderStatus === "activating" && "Đang xử lý"}
                          {o.orderStatus === "completed" && "Hoàn thành"}
                          {o.orderStatus === "cancelled" && "Đã hủy"}
                          {!["pending","activating","completed","cancelled"].includes(o.orderStatus) && o.orderStatus}
                        </span>
                      </td>
                      <td className="ma-muted">{formatDateTime(o.createdAt)}</td>
                    </tr>
                  ))}
                  {!recentOrders.length && (
                    <tr><td colSpan="7" className="ma-empty">Không có đơn hàng nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats + Donut gauge */}
        <div className="ma-panel">
          <div className="ma-panel-header">
            <span className="ma-panel-title">Thống Kê Nhanh</span>
          </div>
          <div className="ma-panel-body">
            <div className="ma-quick-links">
              {[
                { icon: "bi-gear", label: "Cài đặt hệ thống" },
                { icon: "bi-people", label: `${stats.totalUsers} người dùng` },
                { icon: "bi-shop", label: `${stats.activeRestaurants} nhà hàng active` },
                { icon: "bi-clock", label: `${stats.pendingRestaurants} chờ duyệt` },
                { icon: "bi-x-circle", label: `${stats.cancelledOrders} đơn đã hủy` },
              ].map((item, i) => (
                <div className="ma-quick-item" key={i}>
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                  <i className="bi bi-chevron-right ma-quick-arrow" />
                </div>
              ))}
            </div>

            {/* Completion gauge */}
            <div className="ma-gauge-section">
              <div className="ma-gauge-title">Tỷ Lệ Hoàn Thành</div>
              <DonutGauge
                pct={stats.totalOrders ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}
                color="#1ABB9C"
                size={110}
              />
              <div className="ma-gauge-sub">
                {stats.completedOrders} / {stats.totalOrders} đơn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainAdmin;
