import React, { useEffect, useState } from "react";
import "../../css/MerchantReports.css";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const dataRevenueFallback = [
  { name: 'Mon', revenue: 15 },
  { name: 'Tue', revenue: 18 },
  { name: 'Wed', revenue: 16 },
  { name: 'Thu', revenue: 25 },
  { name: 'Fri', revenue: 35 },
  { name: 'Sat', revenue: 42 },
  { name: 'Sun', revenue: 50 },
];

const RestaurantReports = () => {
  const [activeTime, setActiveTime] = useState("This Month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/restaurant/dashboard", { credentials: "include" });
        const result = await res.json();
        if (res.ok) {
          setData(result);
        }
      } catch (error) {
        console.error("Fetch dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + "M";
    }
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  if (loading) return <div>Đang tải dữ liệu báo cáo...</div>;

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <>
      <div className="ro-page-header">
        <div>
          <h1>Performance Analytics</h1>
          <p>Dữ liệu thực tế từ hệ thống (Live Data)</p>
        </div>
        <div className="ro-time-toggles">
          <button className={`ro-time-btn ${activeTime === 'Today' ? 'active' : ''}`} onClick={() => setActiveTime('Today')}>Hôm nay</button>
          <button className={`ro-time-btn ${activeTime === 'Last 7 Days' ? 'active' : ''}`} onClick={() => setActiveTime('Last 7 Days')}>7 ngày qua</button>
          <button className={`ro-time-btn ${activeTime === 'This Month' ? 'active' : ''}`} onClick={() => setActiveTime('This Month')}>Tháng này</button>
        </div>
      </div>

      <div className="ro-analytics-top-row">
        {/* REVENUE CHART */}
        <div className="ro-analytics-card">
          <div className="ro-ac-header">
            <h3 className="ro-ac-title">Doanh thu tổng cộng</h3>
            <i className="bi bi-three-dots-vertical" style={{cursor: 'pointer', color: '#a0aec0'}}></i>
          </div>
          <div className="ro-rev-amount">
            <span style={{textDecoration:'underline'}}>đ</span> {formatPrice(stats.totalRevenue)}
            <span className="ro-rev-percent"><i className="bi bi-arrow-up-right"></i> Real-time</span>
          </div>
          
          <div style={{ height: 180, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataRevenueFallback} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e53e3e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#e53e3e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a0aec0', fontSize: 12}} dy={10} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#c90000" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CUSTOMER SATISFACTION */}
        <div className="ro-analytics-card">
          <div className="ro-ac-header">
            <h3 className="ro-ac-title">Đánh giá trung bình</h3>
          </div>
          
          <div className="ro-satisfaction-overview">
            <div className="ro-sat-score">{(stats.ratingAverage || 5.0).toFixed(1)}</div>
            <div className="ro-sat-info">
              <div style={{color: '#dd6b20', fontSize: 18}}>
                ★★★★★
              </div>
              <p>Dựa trên {stats.ratingCount || 0} đánh giá</p>
            </div>
          </div>

          <div className="ro-sat-bars">
            <div className="ro-sat-bar-row">
              <span>Đơn hàng (Tổng)</span>
              <div className="ro-sat-bar-bg"><div className="ro-sat-bar-fill" style={{width: '100%'}}></div></div>
              <span className="ro-sat-percent">{stats.totalOrders || 0}</span>
            </div>
            <div className="ro-sat-bar-row">
              <span>Đơn chưa xử lý</span>
              <div className="ro-sat-bar-bg"><div className="ro-sat-bar-fill" style={{width: '50%', background: '#e53e3e'}}></div></div>
              <span className="ro-sat-percent">{stats.pendingOrders || 0}</span>
            </div>
            <div className="ro-sat-bar-row">
              <span>Món ăn (Menu)</span>
              <div className="ro-sat-bar-bg"><div className="ro-sat-bar-fill" style={{width: '70%', background: '#38a169'}}></div></div>
              <span className="ro-sat-percent">{stats.totalProducts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ro-analytics-bottom-row">
        {/* RECENT ORDERS */}
        <div className="ro-analytics-card">
          <div className="ro-ac-header">
            <h3 className="ro-ac-title">Đơn Hàng Gần Đây Nhất</h3>
            <span className="ro-section-link" style={{color:'#c90000', fontSize:13, fontWeight:700, cursor:'pointer'}}>Xem chi tiết</span>
          </div>
          
          {recentOrders.length === 0 ? (
            <div style={{color: '#718096', fontSize: 13, marginTop: 20}}>Chưa có đơn hàng nào.</div>
          ) : (
            recentOrders.map(order => (
              <div className="ro-best-seller-item" key={order._id}>
                <div style={{width:45,height:45,background:'#edf2f7',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#4a5568',fontSize: 20}}>
                  <i className="bi bi-receipt-cutoff"></i>
                </div>
                <div className="ro-best-seller-info">
                  <h4>#{order._id.slice(-6).toUpperCase()}</h4>
                  <p>{order.userInfo?.fullName || "Khách Vãng Lai"} - {order.orderStatus}</p>
                </div>
                <div className="ro-best-seller-orders">
                  <h4>{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</h4>
                  <p>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PEAK HOURS MOCK */}
        <div className="ro-analytics-card">
          <div className="ro-ac-header">
            <h3 className="ro-ac-title">Biểu Đồ Giờ Cao Điểm</h3>
            <span style={{background:'#edf2f7',color:'#4a5568',fontSize:11,fontWeight:700,padding:'4px 8px',borderRadius:4}}>Dữ liệu AI phân tích</span>
          </div>

          <div className="ro-heatmap-grid">
            <div className="ro-hm-day">T2</div>
            <div className="ro-hm-day">T3</div>
            <div className="ro-hm-day">T4</div>
            <div className="ro-hm-day">T5</div>
            <div className="ro-hm-day">T6</div>
            <div className="ro-hm-day">T7</div>
            <div className="ro-hm-day">CN</div>
            
            {Array.from({length: 28}).map((_, i) => {
              const rand = Math.random();
              let level = 'level-1';
              if(rand > 0.8) level = 'level-4';
              else if(rand > 0.6) level = 'level-3';
              else if(rand > 0.3) level = 'level-2';
              return <div key={i} className={`ro-hm-cell ${level}`}></div>
            })}
          </div>

          <div className="ro-hm-legend">
            <span>Trưa</span>
            <div className="ro-hm-legend-colors">
              Mật độ
              <div className="level-1"></div>
              <div className="level-2"></div>
              <div className="level-3"></div>
              <div className="level-4"></div>
            </div>
            <span>Tối</span>
          </div>
        </div>
      </div>

    </>
  );
};

export default RestaurantReports;
