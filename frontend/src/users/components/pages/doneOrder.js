import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime } from "../../utils/shop";
import "../../css/MyOrders.css";

function DoneOrder() {
  const [ordersList, setOrdersList] = useState([]);
  const [activeTab, setActiveTab] = useState("Tất cả");
  
  // States for advanced filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all"); // 'all', 'under_100', '100_500', 'over_500'
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'this_week', 'this_month'
  const [isLoading, setIsLoading] = useState(true);

  const TABS = ["Tất cả", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];

  useEffect(() => {
    fetch("/api/checkout/doneOrder", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const groups = Array.isArray(data) ? data : [];
        let allOrders = [];
        groups.forEach(group => {
            if (group.orders && group.orders.length > 0) {
                allOrders = [...allOrders, ...group.orders];
            }
        });
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrdersList(allOrders);
      })
      .catch(() => setOrdersList([]));
  }, []);

  const getStatusInfo = (status) => {
      if (['pending', 'accepted'].includes(status)) return { text: "Đang xử lý", class: "processing", isDone: false };
      if (['delivering', 'shipping'].includes(status)) return { text: "Đang giao", class: "delivering", isDone: false };
      if (['completed', 'done'].includes(status)) return { text: "Hoàn thành", class: "completed", isDone: true };
      if (['cancelled', 'failed'].includes(status)) return { text: "Đã hủy", class: "cancelled", isDone: true };
      
      return { text: "Đang xử lý", class: "processing", isDone: false };
  };

  // ADVANCED FILTER LOGIC WITH REAL DATA
  const filteredOrders = useMemo(() => {
    return ordersList.filter(order => {
        // 1. Tab Filter
        const statusText = getStatusInfo(order.orderStatus).text;
        if (activeTab !== "Tất cả" && statusText !== activeTab) return false;

        // 2. Search Filter (by ID or Restaurant Name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const restaurantName = (order.restaurantInfo?.name || "").toLowerCase();
            const orderId = String(order._id || "").toLowerCase();
            
            if (!restaurantName.includes(query) && !orderId.includes(query)) return false;
        }

        // 3. Price Filter
        const total = order.totalAmount || 0;
        if (priceFilter === 'under_100' && total >= 100000) return false;
        if (priceFilter === '100_500' && (total < 100000 || total > 500000)) return false;
        if (priceFilter === 'over_500' && total <= 500000) return false;

        // 4. Date Filter
        if (dateFilter !== 'all') {
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            if (dateFilter === 'today') {
                if (orderDate.toDateString() !== now.toDateString()) return false;
            } else if (dateFilter === 'this_week') {
                const msInWeek = 7 * 24 * 60 * 60 * 1000;
                if (now - orderDate > msInWeek) return false;
            } else if (dateFilter === 'this_month') {
                if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
            }
        }

        return true;
    });
  }, [ordersList, activeTab, searchQuery, priceFilter, dateFilter]);

  return (
    <div className="gp-orders-wrapper">
      {/* SIDEBAR BỘ LỌC XỊN SÒ */}
      <aside className="gp-orders-sidebar">
        <h3><i className="bi bi-funnel"></i> Bộ lọc nâng cao</h3>
        <p>Tìm kiếm đơn hàng nhanh chóng</p>
        
        <div className="gp-orders-filters">
            {/* SEARCH BAR */}
            <div className="gp-filter-section">
                <label>Tìm kiếm</label>
                <div className="gp-filter-search-box">
                    <i className="bi bi-search"></i>
                    <input 
                        type="text" 
                        placeholder="Mã đơn, Tên quán..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* MỨC GIÁ */}
            <div className="gp-filter-section">
                <label>Mức giá</label>
                <div className="gp-filter-radio-group">
                    <label>
                        <input type="radio" name="price" value="all" checked={priceFilter === 'all'} onChange={() => setPriceFilter('all')} />
                        <span>Tất cả mức giá</span>
                    </label>
                    <label>
                        <input type="radio" name="price" value="under_100" checked={priceFilter === 'under_100'} onChange={() => setPriceFilter('under_100')} />
                        <span>Dưới 100.000đ</span>
                    </label>
                    <label>
                        <input type="radio" name="price" value="100_500" checked={priceFilter === '100_500'} onChange={() => setPriceFilter('100_500')} />
                        <span>100.000đ - 500.000đ</span>
                    </label>
                    <label>
                        <input type="radio" name="price" value="over_500" checked={priceFilter === 'over_500'} onChange={() => setPriceFilter('over_500')} />
                        <span>Trên 500.000đ</span>
                    </label>
                </div>
            </div>

            {/* THỜI GIAN */}
            <div className="gp-filter-section">
                <label>Thời gian đặt</label>
                <div className="gp-filter-radio-group">
                    <label>
                        <input type="radio" name="date" value="all" checked={dateFilter === 'all'} onChange={() => setDateFilter('all')} />
                        <span>Mọi lúc</span>
                    </label>
                    <label>
                        <input type="radio" name="date" value="today" checked={dateFilter === 'today'} onChange={() => setDateFilter('today')} />
                        <span>Hôm nay</span>
                    </label>
                    <label>
                        <input type="radio" name="date" value="this_week" checked={dateFilter === 'this_week'} onChange={() => setDateFilter('this_week')} />
                        <span>Tuần này</span>
                    </label>
                    <label>
                        <input type="radio" name="date" value="this_month" checked={dateFilter === 'this_month'} onChange={() => setDateFilter('this_month')} />
                        <span>Tháng này</span>
                    </label>
                </div>
            </div>

        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main className="gp-orders-content">
        <div className="gp-orders-header-title">
            <h1>Đơn hàng của tôi</h1>
            <span className="gp-orders-count">{filteredOrders.length} Đơn hàng</span>
        </div>
        
        {/* TABS */}
        <div className="gp-orders-tabs">
            {TABS.map(tab => (
                <div 
                    key={tab} 
                    className={`gp-orders-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab}
                </div>
            ))}
        </div>

        {/* ORDER GRID: Hiển thị Full-width 1 cột cho Card đẹp hơn */}
        <div className="gp-orders-list">
            {filteredOrders.length > 0 ? filteredOrders.map(order => {
                const statusInfo = getStatusInfo(order.orderStatus);
                const points = Math.floor((order.totalAmount || 0) / 10000); 
                
                return (
                    <div className="gp-orders-card-premium" key={order._id}>
                        <div className="gp-card-left">
                            <div className="gp-orders-card-header">
                                <h4 className="gp-orders-card-title">
                                    <i className="bi bi-shop"></i> {order.restaurantInfo?.name || "Nhà hàng"}
                                    {order.orderType === "dine_in" ? (
                                        <span style={{marginLeft: '10px', fontSize: '11px', background: '#e3f2fd', color: '#1565c0', padding: '3px 8px', borderRadius: '12px'}}><i className="bi bi-journal-check"></i> Đặt Bàn</span>
                                    ) : (
                                        <span style={{marginLeft: '10px', fontSize: '11px', background: '#fbe9e7', color: '#d84315', padding: '3px 8px', borderRadius: '12px'}}><i className="bi bi-bicycle"></i> Giao Hàng</span>
                                    )}
                                </h4>
                                <span className="gp-order-code">#{String(order._id).slice(-8).toUpperCase()}</span>
                                <span className={`gp-orders-badge ${statusInfo.class}`}>
                                    {statusInfo.text}
                                </span>
                            </div>
                            
                            <p className="gp-orders-card-date">
                                <i className="bi bi-clock-history"></i> Đặt lúc: {formatDateTime(order.createdAt)}
                            </p>

                            {order.orderType === "dine_in" && (
                                <div style={{ background: '#fff3cd', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', display: 'flex', gap: '20px', color: '#856404' }}>
                                    <div><i className="bi bi-display"></i> Bàn số: <strong>{order.tableInfo?.tableNumber || "Đang xếp"}</strong></div>
                                    <div><i className="bi bi-clock"></i> Ngày đến: <strong>{order.tableInfo?.visitDate} ({order.tableInfo?.arrivalTime})</strong></div>
                                    <div><i className="bi bi-people"></i> Số người: <strong>{order.tableInfo?.guestCount || 2}</strong></div>
                                </div>
                            )}

                            <div className="gp-orders-product-list">
                                {order.products && order.products.map((prod, idx) => (
                                    <div className="gp-orders-product-item" key={idx}>
                                        <img src={prod.img || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=100&q=80"} alt="Món" />
                                        <div className="gp-orders-product-info">
                                            <h5 className="gp-orders-product-name">{prod.name || "Tên món ăn"}</h5>
                                            <p className="gp-orders-product-qty">x{prod.quantity || 1}</p>
                                        </div>
                                        <div className="gp-orders-product-price">
                                            {formatCurrency((prod.price || 0) * (prod.quantity || 1))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="gp-card-right">
                            <div className="gp-orders-summary-box">
                                <div className="gp-orders-stat-group">
                                    <span className="gp-orders-stat-label">Tổng thanh toán</span>
                                    <span className="gp-orders-stat-val price">{formatCurrency(order.totalAmount || 0)}</span>
                                </div>
                                <div className="gp-orders-stat-group pts-group">
                                    <span className="gp-orders-stat-label">Tích lũy</span>
                                    <span className="gp-orders-stat-val pts">+{points} Pts</span>
                                </div>
                            </div>
                            
                            <div className="gp-orders-actions">
                                {/* Nếu chưa hoàn thành (chưa thanh toán / đang chờ) -> Hiện nút theo dõi nổi bật */}
                                {!statusInfo.isDone && (
                                    <Link to={`/cart/checkout/success/${order._id}`} className="gp-orders-btn primary pulse">
                                        <i className="bi bi-geo-alt"></i> Theo dõi đơn hàng
                                    </Link>
                                )}
                                
                                {statusInfo.class === 'completed' && (
                                    <>
                                        <Link to={`/cart/checkout/success/${order._id}#review-section`} className="gp-orders-btn outline" style={{ background: 'transparent' }}>
                                            <i className="bi bi-star"></i> Đánh giá
                                        </Link>
                                        <Link to={`/`} className="gp-orders-btn primary">
                                            <i className="bi bi-arrow-repeat"></i> Đặt lại
                                        </Link>
                                    </>
                                )}

                                {statusInfo.class === 'cancelled' && (
                                    <div className="gp-orders-btn outline disabled-look">
                                        Đã đóng
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }) : (
                <div className="gp-orders-empty">
                    <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="Empty" />
                    <h3>Không tìm thấy đơn hàng nào!</h3>
                    <p>Hãy thử thay đổi bộ lọc hoặc đặt món ăn mới nhé.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default DoneOrder;
