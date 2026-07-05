import "../../css/RestaurantChildrenProducts.css";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import CardProducts from "../mixi/cardProducts/cardProducts";
import RestaurantReview from "../mixi/RestaurantReview/RestaurantReview";
import { formatCurrency } from "../../utils/shop";

const RestaurantProducts = () => {
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();
  const { fetchCart, cartItems, updateQuantity } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchRestaurantData = useCallback(async () => {
    setLoading(true);
    try {
      const restaurantRes = await fetch("/api/restaurants");
      const restaurantData = await restaurantRes.json();
      let foundRestaurant = null;
      if (restaurantRes.ok) {
        foundRestaurant = (restaurantData.restaurants || []).find(
          (item) => item.slug === restaurantSlug || item._id === restaurantSlug
        );
        setRestaurant(foundRestaurant || null);
      }

      if (foundRestaurant) {
        const productsRes = await fetch(`/api/restaurants/${foundRestaurant._id}/products`);
        const productsData = await productsRes.json();
        if (productsRes.ok) {
          setProducts(productsData.products || []);
        }

        const vouchersRes = await fetch(`/api/restaurants/${foundRestaurant._id}/vouchers`);
        if (vouchersRes.ok) {
          const vouchersData = await vouchersRes.json();
          setVouchers(vouchersData.vouchers || []);
        }
      }
    } catch (error) {
      console.error("Load restaurant failed", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantSlug]);

  useEffect(() => {
    fetchRestaurantData();
    fetchCart();
  }, [fetchRestaurantData]);

  // Group products by categoryName
  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => { if (p.categoryName) cats.add(p.categoryName); });
    return ["all", ...Array.from(cats)];
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter(p => p.categoryName === activeTab);
  }, [activeTab, products]);

  if (loading) {
      return (
          <div className="gp-res-loading">
              <div className="spinner"></div>
              <p>Đang tải Menu Nhà Hàng...</p>
          </div>
      );
  }
  
  if (!restaurant) return <div className="gp-res-loading">Không tìm thấy nhà hàng</div>;

  const checkIsClosed = () => {
    if (!restaurant.openTime || !restaurant.closeTime) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const [openH, openM] = restaurant.openTime.split(":").map(Number);
    const openTime = openH + openM / 60;

    const [closeH, closeM] = restaurant.closeTime.split(":").map(Number);
    const closeTime = closeH + closeM / 60;

    if (closeTime < openTime) {
      // Crosses midnight
      if (currentTime >= closeTime && currentTime < openTime) return true;
      return false;
    } else {
      if (currentTime < openTime || currentTime >= closeTime) return true;
      return false;
    }
  };

  const isClosed = checkIsClosed();
  const handleCheckout = () => {
    navigate("/cart/checkout");
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
      if (newQuantity < 1) return;
      setUpdatingItemId(productId);
      await updateQuantity(productId, newQuantity);
      setUpdatingItemId(null);
  };

  const restaurantGroup = cartItems?.restaurantGroups?.find(g => g.restaurantId === restaurant?._id);
  const currentCartProducts = restaurantGroup ? restaurantGroup.products : [];
  const currentCartTotal = restaurantGroup ? restaurantGroup.totalAmount : 0;
  const currentCartQuantity = restaurantGroup ? restaurantGroup.totalQuantity : 0;

  return (
    <div className="gp-restaurant-detail-page">
      {/* HERO SECTION */}
      <section className="gp-rd-hero">
        <div className="gp-rd-hero-bg">
          <img src={restaurant.logo || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1920&q=80"} alt="Cover" />
          <div className="gp-rd-hero-overlay"></div>
        </div>

        <header className="gp-rd-header-transparent">
          <button className="gp-rd-icon-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <div className="gp-rd-header-actions">
            <button className="gp-rd-icon-btn"><i className="bi bi-search"></i></button>
            <button className="gp-rd-icon-btn"><i className="bi bi-heart"></i></button>
            <button className="gp-rd-icon-btn"><i className="bi bi-share"></i></button>
          </div>
        </header>

        {/* Floating Restaurant Info Card */}
        <div className="gp-rd-info-wrapper">
            <div className="gp-rd-info-card glass">
                <div className="gp-rd-logo">
                    <img src={restaurant.logo || "https://ui-avatars.com/api/?name=R&background=000&color=fff"} alt="Logo" />
                </div>
                <div className="gp-rd-info-text">
                    <div className="gp-rd-badges">
                        <span className="gp-rd-badge-gold"><i className="bi bi-award-fill"></i> Premium Partner</span>
                        <span className="gp-rd-badge-dark"><i className="bi bi-shop"></i> {restaurant.type || "Nhà hàng 5 Sao"}</span>
                    </div>
                    <h1>{restaurant.name}</h1>
                    <div className="gp-rd-meta">
                        <span className="gp-rd-meta-star"><i className="bi bi-star-fill"></i> {Number(restaurant.ratingAverage || 4.9).toFixed(1)} (2.5k+)</span>
                        <span><i className="bi bi-geo-alt-fill"></i> {restaurant.address || "TP Hồ Chí Minh"}</span>
                        {isClosed ? (
                          <span className="text-danger"><i className="bi bi-clock-fill"></i> Đóng Cửa ({restaurant.openTime} - {restaurant.closeTime})</span>
                        ) : (
                          <span className="text-success"><i className="bi bi-clock-fill"></i> Đang Mở ({restaurant.openTime || "00:00"} - {restaurant.closeTime || "23:59"})</span>
                        )}
                        <Link to={`/restaurant/${restaurant._id}/book-table`} style={{background: '#c90000', color: '#fff', padding: '6px 15px', borderRadius: '20px', marginLeft: 'auto', fontSize: '13px', textDecoration: 'none', fontWeight: 'bold'}}>
                            <i className="bi bi-calendar2-check"></i> Xem sơ đồ & Đặt bàn
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <div className="gp-rd-main-container">
        
        {/* LEFT CONTENT */}
        <div className="gp-rd-content">
          
          {/* Vouchers Section (Tickets) */}
          {vouchers.length > 0 && (
            <div className="gp-rd-vouchers">
              <h3><i className="bi bi-ticket-perforated-fill text-danger"></i> Ưu đãi đặc biệt</h3>
              <div className="gp-rd-voucher-list">
                {vouchers.map((v, idx) => (
                  <div className={`gp-rd-ticket ${idx % 2 !== 0 ? 'green' : ''}`} key={v._id}>
                      <div className="gp-rd-ticket-left">
                          <div className="amount">
                            {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue / 1000}K`}
                          </div>
                          <div className="label">{v.discountType === 'percent' ? 'OFF' : 'GIẢM'}</div>
                      </div>
                      <div className="gp-rd-ticket-right">
                          <p>{v.description || `Đơn tối thiểu ${v.minOrderValue / 1000}k`}</p>
                          <code>{v.code}</code>
                          <button onClick={() => alert("Đã lưu mã " + v.code)}>Lưu</button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sticky Menu Tabs */}
          <div className="gp-rd-tabs-wrapper">
              <div className="gp-rd-tabs">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    className={`gp-rd-tab ${activeTab === cat ? "active" : ""}`}
                    onClick={() => setActiveTab(cat)}
                  >
                    {cat === "all" ? "🔥 Tất cả món ngon" : cat}
                  </button>
                ))}
              </div>
          </div>

          {/* Product List */}
          <div className="gp-rd-product-section">
            <h2 className="gp-rd-section-title">
              {activeTab === "all" ? "Thực Đơn" : activeTab}
            </h2>
            <CardProducts data={visibleProducts} isClosed={isClosed} />
          </div>
          
          <div style={{ marginTop: '30px' }}>
             <RestaurantReview restaurantId={restaurant._id} readOnly={true} />
          </div>

        </div>

        {/* RIGHT SIDEBAR (CART) */}
        <div className="gp-rd-sidebar">
          <div className="gp-rd-cart-sticky">
            <div className="gp-rd-cart-header">
              <h3>Giỏ hàng của bạn</h3>
              <p><i className="bi bi-geo-alt"></i> Giao từ: {restaurant.name}</p>
            </div>
            
            <div className="gp-rd-cart-warning">
              <i className="bi bi-info-circle-fill"></i> 
              Chỉ áp dụng đặt món từ một nhà hàng/đơn.
            </div>

            <div className="gp-rd-cart-items">
              {currentCartProducts.length > 0 ? (
                currentCartProducts.map((item) => (
                  <div key={item.product_id} className="gp-rd-cart-item">
                    <div className="gp-rd-cart-item-info">
                      <h4 style={{fontSize: '14px', marginBottom: '5px'}}>{item.productInfo?.name || item.name}</h4>
                      <span style={{color: '#c90000', fontWeight: 'bold'}}>{formatCurrency(item.productInfo?.price || item.price)}</span>
                    </div>
                    <div className="gp-rd-cart-qty">
                      <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} disabled={updatingItemId === item.product_id || item.quantity <= 1}>
                          {updatingItemId === item.product_id ? <span className="spinner-border spinner-border-sm" style={{width: '12px', height: '12px', borderWidth: '0.15em'}}></span> : <i className="bi bi-dash"></i>}
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} disabled={updatingItemId === item.product_id}>
                          {updatingItemId === item.product_id ? <span className="spinner-border spinner-border-sm" style={{width: '12px', height: '12px', borderWidth: '0.15em'}}></span> : <i className="bi bi-plus"></i>}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="gp-rd-cart-empty">
                    <img src="https://cdn-icons-png.flaticon.com/512/2748/2748927.png" alt="Empty" width="64"/>
                    <p>Giỏ hàng đang trống</p>
                    <small>Hãy chọn vài món ngon nhé!</small>
                </div>
              )}
            </div>

            <div className="gp-rd-cart-footer">
              <div className="gp-rd-cart-total-row">
                <span>Tạm tính ({currentCartQuantity} món)</span>
                <strong>{formatCurrency(currentCartTotal)}</strong>
              </div>
              <div className="gp-rd-promo-link">
                <div><i className="bi bi-ticket-detailed text-danger"></i> Dùng mã khuyến mãi</div>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  className="gp-rd-checkout-btn" 
                  style={{ flex: 1, padding: '12px 5px', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', opacity: isClosed ? 0.6 : 1 }}
                  disabled={currentCartProducts.length === 0 || isClosed}
                  onClick={() => navigate('/cart')}
                >
                  <i className="bi bi-bicycle"></i> {isClosed ? 'Đã đóng cửa' : 'Giao Hàng'}
                </button>
                <button 
                  className="gp-rd-checkout-btn" 
                  style={{ flex: 1, padding: '12px 5px', fontSize: '14px', background: '#2b6cb0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                  onClick={() => navigate(`/restaurant/${restaurant.slug || restaurant._id}/book-table`)}
                >
                  <i className="bi bi-calendar-check"></i> Đặt Bàn
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RestaurantProducts;