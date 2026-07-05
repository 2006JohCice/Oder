import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatCurrency, formatDateTime } from "../../utils/shop";
import "../../css/Tracking.css";
import RestaurantReview from "../mixi/RestaurantReview/RestaurantReview";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function OrderSuccess() {
  const { orderId } = useParams();
  const [payload, setPayload] = useState(null);
  const [seconds, setSeconds] = useState(30);
  const [minutesPassed, setMinutesPassed] = useState(0);
  const [remainingCancelTime, setRemainingCancelTime] = useState(120);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelModalType, setCancelModalType] = useState('normal');

  useEffect(() => {
    fetch(`/api/checkout/success/${orderId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPayload(data))
      .catch(() => setPayload(null));
  }, [orderId]);

  // QR Code timer simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev > 0 ? prev - 1 : 30);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (window.location.hash === '#review-section') {
      setTimeout(() => {
        const el = document.getElementById('review-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500); // small delay to ensure DOM is ready
    }
  }, [payload]);

  const orders = useMemo(() => {
    if (!payload) return [];
    if (payload.type === "group") return payload.orders || [];
    if (payload.order) return [payload.order];
    return [];
  }, [payload]);

  const total = useMemo(
    () => orders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    [orders]
  );

  const firstOrder = orders[0] || {};
  const isDelivery = firstOrder.orderType === "delivery";
  const orderStatus = firstOrder.orderStatus || "pending";
  
  // Timer for 2 minutes check
  useEffect(() => {
    if (!firstOrder.createdAt) return;
    const checkTime = () => {
        const diffMs = Date.now() - new Date(firstOrder.createdAt).getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        setMinutesPassed(diffSecs / 60);
        setRemainingCancelTime(Math.max(0, 120 - diffSecs));
    };
    checkTime();
    const interval = setInterval(checkTime, 1000); // Check every 1s
    return () => clearInterval(interval);
  }, [firstOrder.createdAt]);

  const formatTime = (secs) => {
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  };

  const allProducts = orders.reduce((acc, order) => {
      const prods = Array.isArray(order.products) ? order.products : [];
      return [...acc, ...prods];
  }, []);

  // Determine progress steps
  const getProgressState = () => {
      if (orderStatus === 'cancelled') return 0; // Or whatever represents cancelled

      let step = 1;
      if (['accepted', 'processing'].includes(orderStatus)) step = 2;
      
      // Auto-progress rule: If dine-in, pending, and > 2 mins passed -> step 2
      if (!isDelivery && orderStatus === 'pending' && minutesPassed > 2) {
          step = 2;
      }

      if (['delivering', 'shipping', 'activating'].includes(orderStatus)) step = 3;
      if (['completed', 'done'].includes(orderStatus)) step = 4;
      return step;
  };

  const currentStep = getProgressState();

  const handleCancelOrderClick = () => {
      if (minutesPassed > 2) {
          setCancelModalType('penalty');
      } else {
          setCancelModalType('normal');
      }
      setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
      setShowCancelModal(false);
      setIsCancelling(true);
      try {
          const res = await fetch(`/api/checkout/cancel/${orderId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
          });
          const data = await res.json();
          if (res.ok) {
              alert(data.message);
              window.location.reload();
          } else {
              alert(data.message || "Lỗi khi hủy đơn hàng.");
          }
      } catch (err) {
          alert("Lỗi kết nối.");
      } finally {
          setIsCancelling(false);
      }
  };

  if (!payload || orders.length === 0) {
    return (
        <div className="gp-tracking-loader">
            <div className="gp-spinner"></div>
            <p>Đang tải thông tin đơn hàng...</p>
        </div>
    );
  }

  return (
    <div className="gp-tracking-page-wrapper">
        
        {/* HEADER */}
        <div className="gp-tracking-header">
            <div className="gp-tracking-title">
                <h1>Theo dõi đơn hàng</h1>
                <p>Mã đơn: <strong>#{String(firstOrder._id || orderId).slice(-8).toUpperCase()}</strong> • Đặt lúc {formatDateTime(firstOrder.createdAt)}</p>
            </div>
            <div className="gp-tracking-badge">
                <i className="bi bi-coin"></i> +{Math.floor(total / 1000)} điểm tích lũy
            </div>
        </div>

        <div className="gp-tracking-container">
            
            {/* LEFT COLUMN: Map & Progress */}
            <div className="gp-tracking-left">
                
                {/* Progress Bar */}
                <div className="gp-progress-card">
                    <div className="gp-progress-track">
                        {/* Custom Lines Wrapper */}
                        <div style={{ position: 'absolute', top: '25px', left: '30px', right: '30px', height: '4px', background: '#edf2f7', zIndex: 1 }}>
                            {/* Solid Bar */}
                            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#c90000', width: `${Math.max(0, currentStep - 1) * 33.33}%`, transition: 'width 0.5s ease' }}></div>
                            {/* Animated Bar */}
                            {currentStep < 4 && orderStatus !== 'cancelled' && (
                                <div className="gp-progress-animated-bar" style={{ position: 'absolute', top: 0, left: `${Math.max(0, currentStep - 1) * 33.33}%`, height: '100%', width: '33.33%' }}></div>
                            )}
                        </div>
                        
                        <div className={`gp-progress-step ${currentStep >= 1 ? 'done' : ''} ${currentStep === 1 ? 'active' : ''}`}>
                            <div className="gp-progress-icon"><i className="bi bi-check-lg"></i></div>
                            <span className="gp-progress-label">Chờ xác nhận</span>
                        </div>
                        <div className={`gp-progress-step ${currentStep >= 2 ? 'done' : ''} ${currentStep === 2 ? 'active' : ''}`}>
                            <div className="gp-progress-icon"><i className="bi bi-shop"></i></div>
                            <span className="gp-progress-label">Đang chuẩn bị</span>
                        </div>
                        <div className={`gp-progress-step ${currentStep >= 3 ? 'done' : ''} ${currentStep === 3 ? 'active' : ''}`}>
                            <div className="gp-progress-icon">{isDelivery ? <i className="bi bi-bicycle"></i> : <i className="bi bi-cup-hot"></i>}</div>
                            <span className="gp-progress-label">{isDelivery ? "Đang giao" : "Sẵn sàng lên món"}</span>
                        </div>
                        <div className={`gp-progress-step ${currentStep >= 4 ? 'done' : ''} ${currentStep === 4 ? 'active' : ''}`}>
                            <div className="gp-progress-icon"><i className="bi bi-check2-all"></i></div>
                            <span className="gp-progress-label">Hoàn thành</span>
                        </div>
                    </div>
                </div>

                {/* Map Overlay (Delivery) or Restaurant Cover (Dine-in) */}
                {isDelivery ? (
                    <div className="gp-map-box" style={{ padding: 0, overflow: 'hidden' }}>
                        <MapContainer center={[21.028511, 105.804817]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[21.028511, 105.804817]}>
                                <Popup>
                                    Vị trí nhà hàng
                                </Popup>
                            </Marker>
                        </MapContainer>

                        <div className="gp-map-eta" style={{ zIndex: 10 }}>
                            <i className="bi bi-clock-history"></i> Dự kiến giao: {currentStep === 4 ? "Đã giao xong" : "15 phút nữa"}
                        </div>

                        <div className="gp-driver-card" style={{ zIndex: 10 }}>
                            <div className="gp-driver-info">
                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80" alt="Driver" className="gp-driver-avatar" />
                                <div className="gp-driver-details">
                                    <h4>Nguyễn Văn An (Đối tác giao hàng)</h4>
                                    <p><i className="bi bi-star-fill text-warning"></i> 4.9 • Biển số: 59-X3 123.45</p>
                                </div>
                            </div>
                            <div className="gp-driver-actions">
                                <button><i className="bi bi-telephone-fill"></i></button>
                                <button className="primary"><i className="bi bi-chat-dots-fill"></i></button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="gp-map-box" style={{background: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80") center/cover'}}>
                        <div className="gp-map-eta">
                            <i className="bi bi-info-circle"></i> Đang chờ phục vụ tại bàn
                        </div>
                        <div className="gp-driver-card" style={{justifyContent: 'center', background: 'rgba(255,255,255,0.95)'}}>
                            <div className="gp-driver-details" style={{textAlign: 'center'}}>
                                <h4>Nhà hàng {firstOrder.restaurantInfo?.name || "The Heritage"}</h4>
                                <p>
                                    {orderStatus === 'cancelled' ? "Đơn hàng đã bị hủy." :
                                    currentStep >= 3 ? "Món ăn đã sẵn sàng lên món. Xin quý khách chuẩn bị thưởng thức." :
                                    currentStep >= 2 ? "Nhân viên đang chuẩn bị món ăn của bạn. Vui lòng chờ trong giây lát."
                                    : "Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Show review component directly here instead of a popup if completed */}
                {orderStatus === 'completed' && (firstOrder?.restaurant_id || firstOrder?.restaurantInfo?._id) && (
                    <div id="review-section">
                        <RestaurantReview restaurantId={firstOrder.restaurant_id || firstOrder.restaurantInfo._id} />
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: Info & Summary */}
            <div className="gp-tracking-right">
                
                {/* QR Code Card */}
                <div className="gp-qr-card">
                    <div className="gp-qr-title">MÃ ĐƠN HÀNG ĐIỆN TỬ</div>
                    <div className="gp-qr-image-wrap">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderId}`} alt="QR Code" />
                    </div>
                    <div className="gp-qr-timer">
                        <i className="bi bi-arrow-clockwise"></i> Tự động làm mới sau {seconds}s
                    </div>
                    <div className="gp-qr-card-divider"></div>
                    <div className="gp-qr-footer">
                        <div className="gp-qr-footer-item">
                            <span>Khách hàng</span>
                            <strong>{payload?.user?.fullName || payload?.user?.name || "Khách Hàng"}</strong>
                        </div>
                        <div className="gp-qr-footer-item right" style={{textAlign: 'right'}}>
                            <span>Phương thức</span>
                            <strong>{isDelivery ? "Giao hàng tận nơi" : `Ăn tại bàn ${firstOrder.tableInfo?.displayName || firstOrder.tableInfo?.tableNumber || "--"}`}</strong>
                            {!isDelivery && firstOrder.tableInfo?.area && (
                                <div style={{fontSize: '12px', color: '#718096', marginTop: '2px'}}>{firstOrder.tableInfo.area}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="gp-summary-card">
                    <div className="gp-sc-header">
                        <h4>Tổng quan đơn hàng</h4>
                        <span className="gp-sc-badge">{allProducts.length || 0} Món</span>
                    </div>

                    <div className="gp-sc-items">
                        {allProducts.length > 0 ? allProducts.map((item, idx) => (
                            <div className="gp-sc-item" key={idx}>
                                <img src={item.productInfo?.img || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=80"} alt="Product" />
                                <div className="gp-sc-item-info">
                                    <h5>{item.productInfo?.name || "Tên món ăn"}</h5>
                                    <p>Số lượng: {item.quantity || 1}</p>
                                </div>
                                <div className="gp-sc-item-price">{formatCurrency((item.price || 0) * (item.quantity || 1))}</div>
                            </div>
                        )) : (
                            <div style={{fontSize: 13, color: '#718096'}}>Không lấy được chi tiết món...</div>
                        )}
                    </div>

                    <div className="gp-sc-lines">
                        <div className="gp-sc-line">
                            <span>Tạm tính</span>
                            <strong>{formatCurrency(total)}</strong>
                        </div>
                        <div className="gp-sc-line">
                            <span>Phí giao hàng</span>
                            <strong>{isDelivery ? formatCurrency(15000) : "0 đ"}</strong>
                        </div>
                        <div className="gp-sc-line discount">
                            <span>Khuyến mãi</span>
                            <strong>-{isDelivery ? formatCurrency(15000) : "0 đ"}</strong>
                        </div>
                        <div className="gp-sc-line total">
                            <span>Tổng thanh toán</span>
                            <strong>{formatCurrency(total)}</strong>
                        </div>
                    </div>
                </div>

                {orderStatus === 'pending' || orderStatus === 'activating' || orderStatus === 'accepted' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                        <button 
                            type="button"
                            className="gp-btn-back-orders" 
                            style={{background: '#fff5f5', color: '#c53030', borderColor: '#feb2b2', margin: 0}}
                            onClick={handleCancelOrderClick}
                            disabled={isCancelling}
                        >
                            {isCancelling ? <i className="bi bi-hourglass"></i> : <i className="bi bi-x-circle"></i>} Hủy đơn hàng 
                            {remainingCancelTime > 0 ? ` (Miễn phí trong ${formatTime(remainingCancelTime)})` : ` (Mất cọc)`}
                        </button>
                        {remainingCancelTime === 0 && (
                            <small style={{ color: '#c53030', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                <i className="bi bi-exclamation-triangle"></i> Đã quá 2 phút, hủy sẽ mất cọc.
                            </small>
                        )}
                    </div>
                ) : null}

                {orderStatus === 'cancelled' && (
                    <div style={{background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #feb2b2'}}>
                        <i className="bi bi-info-circle-fill"></i> ĐƠN HÀNG ĐÃ BỊ HỦY
                        {firstOrder.cancelReason?.includes("Mất cọc") && (
                            <div style={{fontSize: '12px', marginTop: '5px'}}>Bạn đã hủy đơn sau 2 phút và bị mất cọc.</div>
                        )}
                    </div>
                )}

                <Link to="/orders" className="gp-btn-back-orders">
                    <i className="bi bi-arrow-left"></i> Về danh sách Đơn hàng
                </Link>

            </div>
        </div>

        {/* Custom Cancel Modal */}
        {showCancelModal && (
            <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'}}>
                <div style={{background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeInUp 0.3s ease-out'}}>
                    <div style={{fontSize: '48px', color: cancelModalType === 'penalty' ? '#e53e3e' : '#dd6b20', marginBottom: '15px'}}>
                        <i className={`bi ${cancelModalType === 'penalty' ? 'bi-exclamation-octagon-fill' : 'bi-question-circle-fill'}`}></i>
                    </div>
                    <h3 style={{fontSize: '20px', fontWeight: '800', color: '#1a202c', margin: '0 0 10px 0'}}>Xác nhận hủy đơn</h3>
                    
                    {cancelModalType === 'penalty' ? (
                        <p style={{fontSize: '14px', color: '#4a5568', margin: '0 0 25px 0', lineHeight: 1.5}}>
                            Bạn đã vượt quá thời gian hủy miễn phí (2 phút). Hủy lúc này bạn sẽ bị <strong style={{color: '#e53e3e'}}>MẤT TOÀN BỘ TIỀN CỌC</strong>. Bạn vẫn muốn tiếp tục?
                        </p>
                    ) : (
                        <p style={{fontSize: '14px', color: '#4a5568', margin: '0 0 25px 0', lineHeight: 1.5}}>
                            Bạn có chắc chắn muốn hủy đơn hàng này không? Quá trình này không thể hoàn tác.
                        </p>
                    )}

                    <div style={{display: 'flex', gap: '15px'}}>
                        <button 
                            style={{flex: 1, padding: '12px', background: '#edf2f7', border: 'none', borderRadius: '10px', color: '#4a5568', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'}} 
                            onClick={() => setShowCancelModal(false)}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#edf2f7'}
                        >
                            Không, Quay lại
                        </button>
                        <button 
                            style={{flex: 1, padding: '12px', background: '#e53e3e', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'}}
                            onClick={handleConfirmCancel}
                            onMouseOver={(e) => e.currentTarget.style.background = '#c53030'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#e53e3e'}
                        >
                            Đồng ý hủy
                        </button>
                    </div>
                </div>
            </div>
        )}

        )}
    </div>
  );
}

export default OrderSuccess;
