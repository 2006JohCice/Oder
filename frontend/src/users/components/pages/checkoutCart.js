import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import { calculateLineTotal, formatCurrency } from "../../utils/shop";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { calculateDistance, calculateETA } from "../../../utils/geo";
import "../../css/Checkout.css";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function CheckoutCart() {
  const [cartData, setCartData] = useState({});
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [formData, setFormData] = useState({
      fullName: "",
      phone: "",
      address: "",
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart, updateQuantity } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, () => {
            setUserLocation({ lat: 21.028511, lng: 105.804817 });
        });
    } else {
        setUserLocation({ lat: 21.028511, lng: 105.804817 });
    }
  }, []);

  const searchParams = new URLSearchParams(location.search);
  const selectedShopsParam = searchParams.get("shops") ? searchParams.get("shops").split(",") : [];

  let groups = Array.isArray(cartData?.restaurantGroups) ? cartData.restaurantGroups : [];
  if (selectedShopsParam.length > 0) {
      groups = groups.filter(g => selectedShopsParam.includes(g.restaurantId));
  }

  useEffect(() => {
    const loadCart = async () => {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.status === 401) {
        navigate("/user/auth/login");
        return;
      }
      const data = await res.json();
      setCartData(data || {});
      if (data && data.restaurantGroups) {
          setSelectedRestaurants(data.restaurantGroups.map(g => g.restaurantId));
      }
    };
    loadCart();

    const loadProfile = async () => {
        try {
            const res = await fetch("/api/user/me", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    fullName: data?.user?.fullname || data?.user?.name || "",
                    phone: data?.user?.phone || "",
                    address: data?.user?.address || "", // If DB has address
                });
            }
        } catch (error) {
            console.error(error);
        }
    };
    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
      setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleDonePay = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address) {
        notifyApp("Vui lòng điền đầy đủ thông tin giao hàng", "warning");
        return;
    }

    const checkedGroups = groups.filter(g => selectedRestaurants.includes(g.restaurantId));
    if (checkedGroups.length === 0) {
        notifyApp("Vui lòng chọn ít nhất một nhà hàng để thanh toán", "warning");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        isPartialCheckout: true,
        restaurantOrders: checkedGroups.map((group) => ({
          restaurantId: group.restaurantId,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          orderType: "delivery",
          tableInfo: {},
        })),
      };

      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        notifyApp("Vui lòng đăng nhập để đặt hàng", "info");
        navigate("/user/auth/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        notifyApp(data.message, "error");
        return;
      }

      await fetchCart();
      notifyApp("Đặt hàng thành công!", "success");
      navigate(`/cart/checkout/success/${data.orderId}`);
    } catch (error) {
      notifyApp("Lỗi khi đặt hàng.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hour = new Date().getHours();
  const isPeakHour = (hour >= 11 && hour <= 13) || (hour >= 18 && hour <= 20);
  const peakSurcharge = isPeakHour ? 10000 : 0;
  const baseDeliveryFee = 15000;
  const addonShopFee = 5000;
  const checkedGroups = groups.filter(g => selectedRestaurants.includes(g.restaurantId));
  const numShops = checkedGroups.length;
  
  // Map calculation for first selected shop
  const firstGroup = checkedGroups[0];
  const restaurantLoc = firstGroup?.restaurantLocation || { lat: 21.028511, lng: 105.804817 };
  const distanceKm = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, restaurantLoc.lat, restaurantLoc.lng) : 0;
  const etaMinutes = calculateETA(distanceKm);

  let deliveryFee = 0;
  let originalFee = 0;
  let batchDiscount = 0;

  if (numShops > 0) {
      originalFee = (baseDeliveryFee + peakSurcharge) * numShops;
      deliveryFee = (baseDeliveryFee + peakSurcharge) + (numShops - 1) * (addonShopFee + peakSurcharge);
      batchDiscount = originalFee - deliveryFee;
  }
  
  const discount = 0; // We can add voucher logic later
  
  const subTotal = checkedGroups.reduce((acc, g) => acc + g.products.reduce((a, p) => a + calculateLineTotal(p), 0), 0);
  const totalPay = subTotal + deliveryFee - discount;
  const totalItems = checkedGroups.reduce((acc, g) => acc + (g.totalQuantity || g.products.reduce((a, p) => a + p.quantity, 0)), 0);

  if (!groups.length) {
    return (
      <div className="gp-page-wrapper" style={{textAlign: 'center', padding: '100px 0'}}>
        <i className="bi bi-basket3" style={{fontSize: 60, color: '#a0aec0'}}></i>
        <h2 style={{marginTop: 20}}>Giỏ hàng trống</h2>
        <Link to="/" className="gp-checkout-add-more" style={{width: 200, margin: '20px auto', display: 'block', textDecoration: 'none'}}>Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="gp-page-wrapper">
      
      <div className="gp-checkout-header">
        <h1>Thanh toán</h1>
        <p>Kiểm tra thông tin giao hàng và xác nhận đặt món</p>
      </div>
      
      <form className="gp-checkout-container" onSubmit={handleDonePay}>
        
        {/* LEFT COLUMN */}
        <div className="gp-checkout-left">
          
          {selectedRestaurants.length > 1 && (
              <div style={{background: '#fffaf0', color: '#dd6b20', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #feebc8', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                  <i className="bi bi-exclamation-triangle-fill" style={{marginTop: '2px', fontSize: '16px'}}></i>
                  <span>Khi bạn đặt hàng từ {selectedRestaurants.length} nhà hàng khác nhau thì có thể {selectedRestaurants.length} shipper khác nhau, tiền ship sẽ tăng lên.</span>
              </div>
          )}

          {/* Delivery Form */}
          <div className="gp-checkout-section gp-shadow-card">
            <div className="gp-checkout-section-title">
              <h3><i className="bi bi-truck text-danger"></i> Thông tin giao hàng</h3>
            </div>
            
            <div className="gp-delivery-form">
                <div className="gp-input-row">
                    <div className="gp-input-group">
                        <label>Người nhận</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và tên..." required />
                    </div>
                    <div className="gp-input-group">
                        <label>Số điện thoại</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="VD: 0901234567" required />
                    </div>
                </div>
                <div className="gp-input-group">
                    <label>Địa chỉ nhận hàng</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, Tên đường, Phường/Xã..." required />
                </div>
                
                {/* Real Map */}
                <div className="gp-delivery-map-preview" style={{ position: 'relative', height: '250px', zIndex: 1, borderRadius: '8px', overflow: 'hidden' }}>
                    {userLocation ? (
                        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            <Marker position={[userLocation.lat, userLocation.lng]} />
                            {firstGroup && <Marker position={[restaurantLoc.lat, restaurantLoc.lng]} />}
                            {firstGroup && <Polyline positions={[[userLocation.lat, userLocation.lng], [restaurantLoc.lat, restaurantLoc.lng]]} color="#c90000" weight={3} dashArray="5, 10" />}
                        </MapContainer>
                    ) : (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: '#333'}}>Đang tải bản đồ...</div>
                    )}
                    {firstGroup && (
                        <div className="gp-map-overlay-eta">
                            <i className="bi bi-geo-alt-fill"></i> Khoảng cách: ~{distanceKm}km ({etaMinutes} phút)
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Restaurant Orders */}
          <div className="gp-checkout-orders-wrap">
            {groups.map(group => (
                <div className="gp-checkout-section gp-shadow-card" key={group.restaurantId} style={{ transition: 'opacity 0.2s', opacity: selectedRestaurants.includes(group.restaurantId) ? 1 : 0.5 }}>
                <div className="gp-checkout-restaurant-header">
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <input 
                            type="checkbox" 
                            checked={selectedRestaurants.includes(group.restaurantId)} 
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedRestaurants(prev => [...prev, group.restaurantId]);
                                } else {
                                    setSelectedRestaurants(prev => prev.filter(id => id !== group.restaurantId));
                                }
                            }} 
                            style={{width: '20px', height: '20px', accentColor: '#c90000', cursor: 'pointer'}}
                        />
                        <h3 style={{margin: 0, cursor: 'pointer'}} onClick={() => {
                            if (selectedRestaurants.includes(group.restaurantId)) {
                                setSelectedRestaurants(prev => prev.filter(id => id !== group.restaurantId));
                            } else {
                                setSelectedRestaurants(prev => [...prev, group.restaurantId]);
                            }
                        }}><i className="bi bi-shop text-danger"></i> {group.restaurantName}</h3>
                    </div>
                    <span className="gp-badge-verified"><i className="bi bi-check-circle-fill"></i> Đối tác Premium</span>
                </div>
                
                <div className="gp-checkout-items">
                    {group.products.map(item => (
                    <div className="gp-checkout-item" key={item.product_id}>
                        <img src={item.productInfo?.img || "https://images.unsplash.com/photo-1544025162-8111142154ea?w=100&q=80"} alt={item.productInfo?.name} className="gp-checkout-item-img" />
                        <div className="gp-checkout-item-info">
                            <h4>{item.productInfo?.name}</h4>
                            <p>{item.productInfo?.description?.substring(0, 40)}...</p>
                            
                            <div className="gp-qty-control-mini">
                                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                                <span>{item.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                            </div>
                        </div>
                        <div className="gp-checkout-item-price">
                            {formatCurrency(calculateLineTotal(item))}
                        </div>
                    </div>
                    ))}
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <Link to={`/restaurant/${group.restaurantSlug || group.restaurantId}/products`} className="gp-checkout-add-more" style={{flex: 1, justifyContent: 'center'}}>
                        <i className="bi bi-plus-circle"></i> Thêm món từ nhà hàng
                    </Link>
                    <Link to={`/restaurant/${group.restaurantSlug || group.restaurantId}/book-table`} className="gp-checkout-add-more" style={{flex: 1, justifyContent: 'center', background: '#fff5f5', color: '#c90000', borderColor: '#feb2b2'}}>
                        <i className="bi bi-calendar-check"></i> Đặt bàn tại đây
                    </Link>
                </div>
                </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="gp-checkout-right">
          
          {/* Vouchers */}
          <div className="gp-checkout-section gp-shadow-card">
            <div className="gp-checkout-section-title">
              <h3><i className="bi bi-ticket-perforated text-danger"></i> Ưu đãi & Giảm giá</h3>
            </div>
            
            <div className="gp-voucher-card applied">
                <div className="gp-voucher-left">
                    <i className="bi bi-bicycle"></i>
                </div>
                <div className="gp-voucher-mid">
                    <h5>Mã Toàn Sàn</h5>
                    <p>FREESHIP</p>
                </div>
                <div className="gp-voucher-right">
                    <span>-35.000đ</span>
                    <i className="bi bi-check-circle-fill"></i>
                </div>
            </div>

            <div className="gp-voucher-card">
                <div className="gp-voucher-left merchant">
                    <i className="bi bi-shop"></i>
                </div>
                <div className="gp-voucher-mid">
                    <h5>Mã Nhà Hàng</h5>
                    <p>GIFT50K</p>
                </div>
                <div className="gp-voucher-right">
                    <button type="button" className="gp-btn-apply-voucher">Áp dụng</button>
                </div>
            </div>

            <p className="gp-voucher-note">
              <i className="bi bi-info-circle"></i> Có thể áp dụng cùng lúc mã Freeship và mã Nhà hàng
            </p>
          </div>

          {/* Summary */}
          <div className="gp-checkout-section gp-shadow-card gp-receipt-card">
            <div className="gp-checkout-section-title">
              <h3>Tóm tắt hóa đơn</h3>
            </div>
            
            <div className="gp-summary-lines">
                <div className="gp-summary-line">
                    <span>Tạm tính ({totalItems} món)</span>
                    <strong>{formatCurrency(subTotal)}</strong>
                </div>
                <div className="gp-summary-line">
                    <span>Phí giao hàng (3.8km)</span>
                    {batchDiscount > 0 ? (
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ textDecoration: 'line-through', color: '#a0aec0', fontSize: '13px', marginRight: '5px' }}>
                                {formatCurrency(originalFee)}
                            </span>
                            <strong>{formatCurrency(deliveryFee)}</strong>
                        </div>
                    ) : (
                        <strong>{formatCurrency(deliveryFee)}</strong>
                    )}
                </div>
                {batchDiscount > 0 && (
                    <div className="gp-summary-line discount" style={{ color: '#38a169', fontSize: '14px', background: '#e6fffa', padding: '8px 12px', borderRadius: '8px', marginTop: '10px' }}>
                        <span><i className="bi bi-stars"></i> Ghép {numShops} shop tiết kiệm được:</span>
                        <strong>-{formatCurrency(batchDiscount)}</strong>
                    </div>
                )}
                {discount > 0 && (
                    <div className="gp-summary-line discount">
                        <span>Khuyến mãi vận chuyển</span>
                        <strong>-{formatCurrency(discount)}</strong>
                    </div>
                )}
            </div>

            <div className="gp-summary-total-box">
                <div className="gp-summary-total">
                    <span>Tổng thanh toán</span>
                    <strong>{formatCurrency(totalPay)}</strong>
                </div>
                <div className="gp-loyalty-pts">
                    <i className="bi bi-coin"></i> Nhận +{Math.floor(totalPay / 1000)} điểm Loyalty
                </div>
            </div>

            <button type="submit" className="gp-btn-confirm-order" disabled={isSubmitting || selectedRestaurants.length === 0}>
              {isSubmitting ? <><i className="bi bi-hourglass-split"></i> Đang xử lý...</> : <>XÁC NHẬN ĐẶT HÀNG <i className="bi bi-arrow-right-circle-fill"></i></>}
            </button>
            
            <p className="gp-terms-text">
              Bằng việc đặt đơn, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a> của chúng tôi.
            </p>
          </div>

        </div>

      </form>
    </div>
  );
}
