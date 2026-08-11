import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import { useCart } from "../mixi/cart/CartContext";
import { formatCurrency } from "../../utils/shop";
import "../../css/TableMap.css";

export default function BookTable() {
    const { restaurantSlug } = useParams();
    const navigate = useNavigate();
    const { cartItems, fetchCart } = useCart();
    
    const [restaurant, setRestaurant] = useState(null);
    const [restaurantProducts, setRestaurantProducts] = useState([]);
    const [availableTables, setAvailableTables] = useState([]);
    const [mapLayout, setMapLayout] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Booking Form State
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
    const [arrivalTime, setArrivalTime] = useState("18:00");
    const [selectedTables, setSelectedTables] = useState([]);
    
    // User Info State
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");

    const restaurantGroup = cartItems?.restaurantGroups?.find(g => g.restaurantId === restaurant?._id);
    const currentCartProducts = restaurantGroup ? restaurantGroup.products : [];
    const currentCartTotal = restaurantGroup ? restaurantGroup.totalAmount : 0;

    useEffect(() => {
        const fetchRes = async () => {
            try {
                const res = await fetch("/api/restaurants");
                const data = await res.json();
                const found = (data.restaurants || []).find((item) => item.slug === restaurantSlug || item._id === restaurantSlug);
                setRestaurant(found);

                if (found) {
                    try {
                        const prodRes = await fetch(`/api/restaurants/${found._id}/products`);
                        const prodData = await prodRes.json();
                        if (prodRes.ok) {
                            setRestaurantProducts(prodData.products || []);
                        }
                    } catch (e) {
                        console.error("Failed to load products", e);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchRes();
    }, [restaurantSlug]);

    const fetchTables = async () => {
        if (!restaurant?._id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                restaurantId: restaurant._id,
                visitDate,
                arrivalTime
            });

            const res = await fetch(`/api/tables/available?${params.toString()}`);
            const data = await res.json();
            
            if (res.ok) {
                const allTables = Array.isArray(data.allTables) ? data.allTables : [];
                const availTables = Array.isArray(data.tables) ? data.tables : [];
                
                if (allTables.length > 0) {
                    const parsedLayout = allTables.map(t => {
                        let parsedType = "circle";
                        let seats = 4;
                        if (t.shape === "rect-small") { parsedType = "rect"; seats = 2; }
                        if (t.shape === "rect-large") { parsedType = "large"; seats = 8; }
                        if (t.shape === "round") { parsedType = "circle"; seats = 4; }
                        
                        return {
                            id: t._id,
                            tableNumber: t.tableNumber,
                            label: t.displayName || t.tableNumber,
                            type: parsedType,
                            seats: seats,
                            area: t.area || "General",
                            capacity: t.capacity || 4,
                            style: { top: `${t.y || 40}px`, left: `${t.x || 40}px` },
                            isAvailable: availTables.some(at => at._id === t._id)
                        };
                    });
                    setMapLayout(parsedLayout);
                } else {
                    setMapLayout([]); // Shop has no tables
                }
                setAvailableTables(availTables);
            }
        } catch (error) {
            console.error("Lỗi khi tải sơ đồ bàn", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurant?._id) {
            fetchTables();
            setSelectedTables([]);
        }
    }, [restaurant, visitDate, arrivalTime]);

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        if (selectedTables.length === 0) return notifyApp("Vui lòng click chọn bàn trên sơ đồ", "error");
        
        const totalCapacity = selectedTables.reduce((sum, t) => sum + (t.capacity || 0), 0);
        const tableNumbers = selectedTables.map(t => t.tableNumber).join(", ");
        const areas = [...new Set(selectedTables.map(t => t.area))].join(", ");

        setIsSubmitting(true);
        const payload = {
            isPartialCheckout: true,
            restaurantOrders: [
                {
                    restaurantId: restaurant._id,
                    fullName: fullName || "Khách Đặt Bàn",
                    phone: phone || "0999999999",
                    address: "Tại nhà hàng",
                    orderType: "dine_in",
                    note: note,
                    tableInfo: {
                        area: areas,
                        tableNumber: tableNumbers,
                        guestCount: totalCapacity,
                        visitDate,
                        arrivalTime
                    }
                }
            ]
        };

        try {
            const res = await fetch("/api/checkout/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            
            const data = await res.json();
            if (res.ok) {
                notifyApp("Đặt bàn thành công!", "success");
                await fetchCart();
                navigate(`/cart/checkout/success/${data.orderId}`);
            } else {
                notifyApp(data.message || "Lỗi đặt bàn", "error");
            }
        } catch (err) {
            notifyApp("Lỗi hệ thống", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderChairs = (type, count) => {
        let chairs = [];
        for (let i = 0; i < count; i++) {
            chairs.push(<div key={i} className={`gp-chair gp-chair-${type}-${i+1}`}></div>);
        }
        return chairs;
    };

    if (!restaurant) return <div className="gp-res-loading"><div className="spinner"></div></div>;

    const totalCapacity = selectedTables.reduce((sum, t) => sum + (t.capacity || 0), 0);
    const depositAmount = 200000;

    return (
        <div className="gp-res-page-wrapper">
            <div className="gp-res-header-premium">
                <div className="gp-res-title-premium">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
                        <button className="gp-bt-back" onClick={() => navigate(-1)} style={{ background: 'transparent', border: '1px solid #c90000', color: '#c90000', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>
                            <i className="bi bi-arrow-left"></i> Trở về
                        </button>
                        <span className="gp-res-badge-top" style={{ margin: 0 }}>TÍNH NĂNG VIP</span>
                    </div>
                    <h1>Sơ Đồ Đặt Bàn Thông Minh</h1>
                    <h2>{restaurant.name}</h2>
                    <p>Trải nghiệm sơ đồ không gian 2D. Vui lòng nhấp trực tiếp vào bàn để giữ chỗ ngồi yêu thích.</p>
                </div>
            </div>

            <div className="gp-reservation-layout">
                {/* LEFT: 2D MAP */}
                <div className="gp-reservation-map-col">
                    <div className="gp-map-premium-card">
                        <div className="gp-map-legend-bar">
                            <h3><i className="bi bi-map-fill"></i> Bản Đồ Không Gian (Floor Plan)</h3>
                            <div className="gp-map-legend">
                                <div className="gp-legend-item"><span className="gpl-dot available"></span> Có sẵn</div>
                                <div className="gp-legend-item"><span className="gpl-dot selected"></span> Đang chọn</div>
                                <div className="gp-legend-item"><span className="gpl-dot booked"></span> Đã đặt / Có khách</div>
                            </div>
                        </div>

                        <div className="gp-map-floor-area">
                            {loading ? (
                                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                                    <div className="spinner-border text-danger"></div>
                                </div>
                            ) : mapLayout.length === 0 ? (
                                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#718096'}}>
                                    <i className="bi bi-map" style={{fontSize: '40px'}}></i>
                                    <p style={{marginTop: '10px'}}>Nhà hàng chưa thiết lập sơ đồ 2D.</p>
                                </div>
                            ) : (
                                mapLayout.map((table) => {
                                    const isSelected = selectedTables.some(t => t.id === table.id);
                                    let statusClass = "status-available";
                                    
                                    if (isSelected) statusClass = "status-selected";
                                    else if (!table.isAvailable) statusClass = "status-booked";

                                    let shapeClass = `gp-table-premium-${table.type}`;

                                    return (
                                        <div 
                                            key={table.id}
                                            className={`gp-table-premium ${shapeClass} ${statusClass}`}
                                            style={table.style}
                                            onClick={() => {
                                                if (!table.isAvailable) {
                                                    notifyApp("Bàn này đã được đặt trong khung giờ này. Vui lòng chọn bàn khác hoặc đổi giờ!", "warning");
                                                    return;
                                                }
                                                setSelectedTables(prev => {
                                                    if (prev.find(t => t.id === table.id)) {
                                                        return prev.filter(t => t.id !== table.id);
                                                    }
                                                    return [...prev, table];
                                                });
                                            }}
                                        >
                                            {renderChairs(table.type, table.seats)}
                                            <div className="gp-table-surface">
                                                <span>{table.label}</span>
                                                {table.type === "large" && <small>{table.capacity} Pax</small>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="gp-info-cards-row">
                        <div className="gp-info-card-premium green">
                            <i className="bi bi-shield-check icon"></i>
                            <div>
                                <h4>Khóa Bàn Tự Động (Auto-Lock)</h4>
                                <p>Hệ thống tự động khóa bàn bạn đang thao tác để tránh trùng lặp với khách khác.</p>
                            </div>
                        </div>
                        <div className="gp-info-card-premium gold">
                            <i className="bi bi-gem icon"></i>
                            <div>
                                <h4>Cam Kết Chỗ Ngồi VIP</h4>
                                <p>Sơ đồ thời gian thực. Đảm bảo bàn của bạn sẵn sàng 100% khi bạn đến.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PREMIUM FORM WIDGET */}
                <div className="gp-reservation-form-col">
                    <form className="gp-res-widget" onSubmit={handleConfirmBooking}>
                        <div className="gp-widget-header">
                            <h3><i className="bi bi-calendar2-check-fill"></i> Phiếu Đặt Chỗ</h3>
                        </div>
                        
                        <div className="gp-widget-body">
                            <div className="gp-input-row">
                                <div className="gp-input-box">
                                    <label><i className="bi bi-calendar-event"></i> Ngày đến</label>
                                    <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
                                </div>
                                <div className="gp-input-box">
                                    <label><i className="bi bi-clock"></i> Giờ đến</label>
                                    <input type="time" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} required />
                                </div>
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px'}}>
                                <div className="gp-input-box" style={{width: '100%'}}>
                                    <label><i className="bi bi-person"></i> Tên người đặt</label>
                                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="VD: Anh Tùng" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                </div>
                                <div className="gp-input-box" style={{width: '100%'}}>
                                    <label><i className="bi bi-telephone"></i> Số điện thoại</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="VD: 0987654321" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                </div>
                                <div className="gp-input-box" style={{width: '100%'}}>
                                    <label><i className="bi bi-pencil-square"></i> Ghi chú thêm</label>
                                    <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="VD: Cần ghế trẻ em..." style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                </div>
                            </div>

                            {/* Food items */}
                            {currentCartProducts.length > 0 && (
                                <div className="gp-bt-cart-items" style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                                    <h4 style={{fontSize: '13px', marginBottom: '10px', color: '#4a5568'}}><i className="bi bi-cart3"></i> Các món đã chọn trước:</h4>
                                    <div style={{maxHeight: '150px', overflowY: 'auto', paddingRight: '5px'}}>
                                        {currentCartProducts.map(item => (
                                            <div key={item.product_id} style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                                <img src={item.productInfo?.img || "https://images.unsplash.com/photo-1544025162-8111142154ea?w=100&q=80"} alt={item.productInfo?.name} style={{width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px'}} />
                                                <div style={{flex: 1}}>
                                                    <div style={{fontSize: '12px', fontWeight: 'bold'}}>{item.productInfo?.name}</div>
                                                    <div style={{fontSize: '11px', color: '#718096'}}>x{item.quantity}</div>
                                                </div>
                                                <div style={{fontSize: '12px', fontWeight: 'bold', color: '#c90000'}}>
                                                    {formatCurrency((item.productInfo?.price || 0) * item.quantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', fontWeight: 'bold', fontSize: '13px'}}>
                                        <span>Tạm tính món ăn:</span>
                                        <span style={{color: '#c90000'}}>{formatCurrency(currentCartTotal)}</span>
                                    </div>
                                </div>
                            )}

                            {depositAmount > 0 && (
                                <div className="gp-deposit-alert" style={{marginTop: '15px'}}>
                                    <i className="bi bi-info-circle-fill"></i>
                                    <div>
                                        <strong>Yêu cầu đặt cọc: {formatCurrency(depositAmount)}</strong>
                                        <p>Nhà hàng yêu cầu thanh toán cọc để giữ chỗ cho bạn.</p>
                                    </div>
                                </div>
                            )}

                            {/* Summary Receipt */}
                            <div className="gp-receipt-box" style={{marginTop: '15px'}}>
                                <div className="gp-receipt-line">
                                    <span>Tổng số khách:</span>
                                    <strong style={{fontSize: '16px', color: '#2b6cb0'}}>{totalCapacity} Người</strong>
                                </div>
                                <div className="gp-receipt-line">
                                    <span>Bàn số:</span>
                                    <strong className={selectedTables.length > 0 ? 'text-red' : ''}>
                                        {selectedTables.map(t => t.label).join(", ") || "Vui lòng chọn trên sơ đồ"}
                                    </strong>
                                </div>
                                <div className="gp-receipt-divider"></div>
                                <div className="gp-receipt-total">
                                    <span>Tổng Cọc:</span>
                                    <strong className="total-price">{formatCurrency(depositAmount)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="gp-widget-footer">
                            <button type="submit" className="gp-btn-confirm" disabled={selectedTables.length === 0 || isSubmitting}>
                                {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT BÀN"} <i className="bi bi-chevron-right"></i>
                            </button>
                            <p className="gp-policy-text">
                                Hệ thống sẽ tự động xếp số lượng khách tương ứng với các bàn bạn đã chọn. Bằng việc xác nhận, bạn đồng ý với <Link to="/legal/terms">Điều khoản sử dụng</Link> của chúng tôi.
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* ATTRACTION SECTION - RESTAURANT DISHES */}
            {restaurantProducts.length > 0 && (
                <div style={{ marginTop: '40px', padding: '20px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a202c' }}><i className="bi bi-star-fill text-warning"></i> Món Ngon Tại Nhà Hàng</h3>
                        <Link to={`/restaurant/${restaurant.slug || restaurant._id}/products`} style={{ color: '#c90000', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                            Xem Toàn Bộ Menu <i className="bi bi-arrow-right"></i>
                        </Link>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }} className="gp-horizontal-scroll">
                        {restaurantProducts.slice(0, 6).map(prod => (
                            <Link to={`/restaurant/${restaurant.slug || restaurant._id}/products/detail/${prod.slug}`} key={prod._id} style={{ textDecoration: 'none', color: 'inherit', minWidth: '160px', width: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #edf2f7', background: '#fff', display: 'block', transition: 'transform 0.2s', cursor: 'pointer' }}>
                                <img src={prod.img || "https://placehold.co/160x160?text=Food"} alt={prod.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                <div style={{ padding: '10px' }}>
                                    <h4 style={{ fontSize: '13px', margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h4>
                                    <p style={{ margin: 0, color: '#c90000', fontWeight: 'bold', fontSize: '13px' }}>{formatCurrency(prod.price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
