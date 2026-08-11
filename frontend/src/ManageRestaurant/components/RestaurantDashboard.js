import { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "../../users/utils/shop";
import "../css/RestaurantDashboard.css";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const RestaurantDashboard = ({ restaurant }) => {
  const [dashboard, setDashboard] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      ratingAverage: 0,
      ratingCount: 0,
    },
    chartData: [],
    recentOrders: [],
    recentFeedbacks: [],
  });
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/restaurant/dashboard", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setDashboard(data);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [restaurant]);

  if (loading) {
    return (
      <div className="adm-dash-loading">
        <div className="spinner-border text-info" role="status"></div>
        <p>Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }

  const { stats, chartData, recentOrders, recentFeedbacks } = dashboard;

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="adm-status-badge success">HOÀN THÀNH</span>;
      case "pending":
      case "activating":
        return <span className="adm-status-badge warning">ĐANG XỬ LÝ</span>;
      case "cancelled":
        return <span className="adm-status-badge danger">ĐÃ HỦY</span>;
      default:
        return <span className="adm-status-badge secondary">{status.toUpperCase()}</span>;
    }
  };

  const getOrderTypeBadge = (type) => {
    if (type === "delivery") {
      return <span className="adm-type-badge delivery">Giao hàng</span>;
    }
    return <span className="adm-type-badge dine_in">Đặt bàn</span>;
  };

  // Pie chart calculation
  const totalCompleted = stats.completedOrders || 0;
  const totalOthers = stats.totalOrders - totalCompleted;
  const pieData = [
    { name: "Hoàn thành", value: totalCompleted },
    { name: "Khác", value: totalOthers > 0 ? totalOthers : 0 }
  ];
  const pieColors = ["#1ABB9C", "#e2e8f0"];
  const completionRate = stats.totalOrders > 0 ? Math.round((totalCompleted / stats.totalOrders) * 100) : 0;

  // Pagination logic
  const totalPages = Math.ceil(recentOrders.length / itemsPerPage);
  const currentOrders = recentOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="adm-dashboard-container">
      {/* 1. TOP STATS ROW */}
      <div className="adm-stats-row">
        
        <div className="adm-stat-box">
          <div className="adm-stat-icon-wrapper users">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="adm-stat-info">
            <h4>TỔNG SẢN PHẨM</h4>
            <h2>{stats.totalProducts}</h2>
            <p className="adm-stat-growth positive">Active trong menu</p>
          </div>
        </div>

        <div className="adm-stat-box">
          <div className="adm-stat-icon-wrapper orders">
            <i className="bi bi-bag-check"></i>
          </div>
          <div className="adm-stat-info">
            <h4>TỔNG ĐƠN HÀNG</h4>
            <h2>{stats.totalOrders}</h2>
            <p className="adm-stat-growth positive">Lịch sử đơn</p>
          </div>
        </div>

        <div className="adm-stat-box">
          <div className="adm-stat-icon-wrapper pending">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="adm-stat-info">
            <h4>ĐƠN ĐANG CHỜ</h4>
            <h2>{stats.pendingOrders}</h2>
            <p className="adm-stat-growth warning">Cần xử lý</p>
          </div>
        </div>

        <div className="adm-stat-box">
          <div className="adm-stat-icon-wrapper completed">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="adm-stat-info">
            <h4>ĐƠN HOÀN THÀNH</h4>
            <h2>{stats.completedOrders}</h2>
            <p className="adm-stat-growth positive">Đã thành công</p>
          </div>
        </div>

        <div className="adm-stat-box">
          <div className="adm-stat-icon-wrapper revenue">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="adm-stat-info">
            <h4>DOANH THU</h4>
            <h2>{formatCurrency(stats.totalRevenue)}</h2>
            <p className="adm-stat-growth neutral">+0 chờ duyệt</p>
          </div>
        </div>

      </div>

      {/* 2. CHARTS ROW */}
      <div className="adm-charts-row">
        {/* Left: Area Chart */}
        <div className="adm-panel chart-panel">
          <div className="adm-panel-header">
            <h3>Hoạt động Đơn hàng <span>Theo tuần</span></h3>
            <div className="adm-panel-tools">
              <i className="bi bi-chevron-up"></i>
              <i className="bi bi-wrench"></i>
              <i className="bi bi-x"></i>
            </div>
          </div>
          
          <div className="adm-chart-legend-top">
            <span className="legend-item"><span className="dot delivery"></span> Giao hàng</span>
            <span className="legend-item"><span className="dot dine_in"></span> Đặt bàn</span>
          </div>

          <div className="adm-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498DB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3498DB" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDineIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1ABB9C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1ABB9C" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#a0aec0" tick={{ fill: '#718096' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#2d3748', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="delivery" stroke="#3498DB" fillOpacity={1} fill="url(#colorDelivery)" />
                <Area type="monotone" dataKey="dine_in" stroke="#1ABB9C" fillOpacity={1} fill="url(#colorDineIn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Feedback / Bars */}
        <div className="adm-panel feedbacks-panel">
          <div className="adm-panel-header">
            <h3>Phản Hồi Mới</h3>
            <div className="adm-panel-tools">
              <i className="bi bi-chevron-up"></i>
              <i className="bi bi-x"></i>
            </div>
          </div>
          <div className="adm-feedback-list">
            {recentFeedbacks.length === 0 ? (
              <p className="adm-empty-text">Chưa có phản hồi nào</p>
            ) : (
              recentFeedbacks.map((fb, idx) => (
                <div className="adm-feedback-item" key={idx}>
                  <div className="fb-left">
                    <div className="fb-avatar"><i className="bi bi-person"></i></div>
                    <div className="fb-info">
                      <strong>{fb.fullname || "Khách"}</strong>
                      <span>"{fb.content || "Không có nội dung"}"</span>
                    </div>
                  </div>
                  <div className="fb-right">
                    <span className="fb-rating"><i className="bi bi-star-fill"></i> {fb.rating}.0</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. TABLE ROW */}
      <div className="adm-table-row">
        {/* Left: Big Table */}
        <div className="adm-panel table-panel">
          <div className="adm-panel-header">
            <h3>Đơn Hàng Gần Đây</h3>
            <div className="adm-panel-tools">
              <i className="bi bi-chevron-up"></i>
              <i className="bi bi-wrench"></i>
              <i className="bi bi-x"></i>
            </div>
          </div>
          
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>MÃ ĐƠN</th>
                  <th>KHÁCH HÀNG</th>
                  <th>LOẠI</th>
                  <th>TỔNG</th>
                  <th>TRẠNG THÁI</th>
                  <th>NGÀY TẠO</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length === 0 ? (
                  <tr><td colSpan="6" className="adm-empty-text text-center py-4">Chưa có đơn hàng nào</td></tr>
                ) : (
                  currentOrders.map(order => (
                    <tr key={order._id}>
                      <td className="font-mono">
                        {order.orderGroupCode || order._id.substring(0,8).toUpperCase()}
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="c-name">{order.userInfo?.fullName || "Khách hàng"}</span>
                          {order.userInfo?.phone && <span className="c-sub">{order.userInfo.phone}</span>}
                        </div>
                      </td>
                      <td>{getOrderTypeBadge(order.orderType)}</td>
                      <td className="c-total">{formatCurrency(order.totalAmount || 0)}</td>
                      <td>{getOrderStatusBadge(order.orderStatus)}</td>
                      <td className="c-date">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="adm-pagination">
              <button 
                className="adm-page-btn" 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i> Trước
              </button>
              <button className="adm-page-btn active">
                <span>{currentPage}</span> / <span>{totalPages}</span>
              </button>

              <button 
                className="adm-page-btn" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Sau <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}

        </div>

        {/* Right: Quick Stats & Pie */}
        <div className="adm-panel quickstats-panel">
          <div className="adm-panel-header">
            <h3>Thống Kê Nhanh</h3>
          </div>
          <ul className="adm-quick-list">
            <li><i className="bi bi-gear"></i> Cài đặt hệ thống <i className="bi bi-chevron-right ms-auto"></i></li>
            <li><i className="bi bi-people"></i> {stats.ratingCount} lượt đánh giá <i className="bi bi-chevron-right ms-auto"></i></li>
            <li><i className="bi bi-shop"></i> Cửa hàng: {restaurant?.name} <i className="bi bi-chevron-right ms-auto"></i></li>
            <li><i className="bi bi-clock"></i> {stats.pendingOrders} chờ duyệt <i className="bi bi-chevron-right ms-auto"></i></li>
            <li><i className="bi bi-x-circle"></i> {stats.cancelledOrders} đơn đã hủy <i className="bi bi-chevron-right ms-auto"></i></li>
          </ul>

          <div className="adm-pie-container">
            <h5>Tỷ Lệ Hoàn Thành</h5>
            <div className="adm-pie-wrapper">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="adm-pie-center">
                <span>{completionRate}%</span>
              </div>
            </div>
            <p className="adm-pie-subtext">{totalCompleted} / {stats.totalOrders} đơn</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
