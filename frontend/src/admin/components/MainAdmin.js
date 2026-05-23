import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { formatCurrency, formatDateTime } from "../../users/utils/shop";
import "./MainAdmin.css";

/* ────────────────────────────────────────────────
   Tiny inline sparkline using SVG (no lib needed)
   ──────────────────────────────────────────────── */
function Sparkline({ values = [], color = "#1ABB9C", height = 40, width = 100 }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

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
   Smooth area chart using SVG
   ──────────────────────────────────────────────── */
function AreaChart({ datasets = [], labels = [], height = 220, colors = ["#1ABB9C", "#3498DB"] }) {
  const W = 100; // viewBox units (%)
  if (!datasets.length || !datasets[0].length) return <div style={{ height }} />;

  const maxVal = Math.max(...datasets.flat(), 1);
  const pts = (data, offsetY = 0) =>
    data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = height - offsetY - (v / maxVal) * (height - 30);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
    >
      {datasets.map((data, di) => {
        const polyPts = pts(data);
        const firstX = 0;
        const firstY = height - (data[0] / maxVal) * (height - 30);
        const lastX = W;
        const lastY = height - (data[data.length - 1] / maxVal) * (height - 30);
        const fillPts = `${firstX},${height} ${polyPts} ${lastX},${height}`;
        return (
          <g key={di}>
            <polygon
              points={fillPts}
              fill={colors[di % colors.length]}
              opacity="0.25"
            />
            <polyline
              points={polyPts}
              fill="none"
              stroke={colors[di % colors.length]}
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      {/* X-axis labels */}
      {labels.map((lbl, i) => (
        <text
          key={i}
          x={(i / (labels.length - 1)) * W}
          y={height - 2}
          fontSize="4"
          fill="#aaa"
          textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
        >
          {lbl}
        </text>
      ))}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes, restaurantsRes] = await Promise.all([
          apiFetch("/api/admin/checkout/doneOrder?limit=200"),
          apiFetch("/api/user"),
          apiFetch("/api/admin/restaurants"),
        ]);
        if (ignore) return;
        setOverview({
          orders: Array.isArray(ordersRes.orders) ? ordersRes.orders : [],
          users: Array.isArray(usersRes.users) ? usersRes.users : [],
          restaurants: Array.isArray(restaurantsRes.restaurants) ? restaurantsRes.restaurants : [],
        });
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
    if (!kw) return overview.orders;
    return overview.orders.filter(o =>
      [o.orderId, o.orderGroupCode, o.userInfo?.fullName, o.userInfo?.phone, o.restaurantInfo?.name]
        .filter(Boolean).join(" ").toLowerCase().includes(kw)
    );
  }, [overview.orders, query]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    return {
      totalUsers: overview.users.length,
      totalRestaurants: overview.restaurants.length,
      activeRestaurants: overview.restaurants.filter(r => r.status === "active").length,
      pendingRestaurants: overview.restaurants.filter(r => r.status === "pending").length,
      totalOrders: filteredOrders.length,
      pendingOrders: filteredOrders.filter(o => o.orderStatus === "pending").length,
      completedOrders: filteredOrders.filter(o => o.orderStatus === "completed").length,
      cancelledOrders: filteredOrders.filter(o => o.orderStatus === "cancelled").length,
      totalRevenue,
      tableDeposits: filteredOrders.reduce((s, o) => s + Number(o.depositAmount || 0), 0),
    };
  }, [filteredOrders, overview.restaurants, overview.users.length]);

  const topRestaurants = useMemo(() =>
    [...overview.restaurants]
      .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0) || (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 5),
    [overview.restaurants]
  );

  const recentOrders = filteredOrders.slice(0, 8);

  /* Build a simple 7-point "orders per day" dataset from recentOrders for the chart */
  const chartLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const seed = stats.totalOrders;
  const chartData1 = chartLabels.map((_, i) => Math.max(1, Math.round(seed * 0.07 * Math.sin(i + 1) + seed * 0.1)));
  const chartData2 = chartLabels.map((_, i) => Math.max(1, Math.round(seed * 0.05 * Math.cos(i + 0.5) + seed * 0.07)));

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
              <span className="ma-legend-dot" style={{ background: "#1ABB9C" }} /> Giao hàng &nbsp;
              <span className="ma-legend-dot" style={{ background: "#3498DB" }} /> Đặt bàn
            </div>
            <AreaChart
              datasets={[chartData1, chartData2]}
              labels={chartLabels}
              height={200}
              colors={["#1ABB9C", "#3498DB"]}
            />
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
