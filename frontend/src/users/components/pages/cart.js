import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../mixi/cart/CartContext";
import { calculateLineTotal, formatCurrency } from "../../utils/shop";
import FeaturedProducts from "../MainContents/products/featuredProducts";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import "../../css/Cart.css"; // We'll create this CSS

export default function CartPage() {
  const { cartItems, totalQuantity, fetchCart, loading, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [selectedShops, setSelectedShops] = useState([]);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const groups = Array.isArray(cartItems?.restaurantGroups) ? cartItems.restaurantGroups : [];

  useEffect(() => {
    if (groups.length > 0 && selectedShops.length === 0) {
      setSelectedShops(groups.map(g => g.restaurantId));
    }
  }, [cartItems]);

  const toggleShop = (id) => {
    setSelectedShops(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedGroups = groups.filter(g => selectedShops.includes(g.restaurantId));
  const selectedTotalQuantity = selectedGroups.reduce((acc, g) => acc + g.products.reduce((a, p) => a + p.quantity, 0), 0);
  const selectedTotalPrice = selectedGroups.reduce((acc, g) => acc + g.products.reduce((a, p) => a + calculateLineTotal(p), 0), 0);

  const handleRemove = async (id) => {
    const res = await fetch(`/api/cart/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 401) {
      notifyApp("Vui lòng đăng nhập để thao tác với giỏ hàng", "info");
      navigate("/user/auth/login");
      return;
    }

    if (res.ok) {
      await fetchCart();
      notifyApp("Đã xóa sản phẩm khỏi giỏ hàng", "success");
      return;
    }

    notifyApp("Không thể xóa sản phẩm khỏi giỏ hàng", "error");
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(productId);
    const success = await updateQuantity(productId, newQuantity);
    if (!success) {
      notifyApp("Không thể cập nhật số lượng", "error");
    }
    setUpdatingItemId(null);
  };

  if (loading) {
    return (
        <div className="gp-cart-loader">
            <div className="gp-spinner"></div>
            <p>Đang tải giỏ hàng...</p>
        </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="gp-page-wrapper">
        <section className="gp-cart-empty">
          <div className="gp-cart-empty-icon">
            <i className="bi bi-cart-x" />
          </div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Có vẻ như bạn chưa chọn món ăn nào. Hãy khám phá thực đơn của chúng tôi ngay!</p>

          <div className="gp-cart-empty-actions">
            <Link to="/products" className="gp-btn-primary">
              Khám phá thực đơn
            </Link>
            <Link to="/" className="gp-btn-outline">
              Về trang chủ
            </Link>
          </div>
        </section>

        <FeaturedProducts />
      </div>
    );
  }

  return (
    <div className="gp-cart-page-wrapper">
        <div className="gp-cart-header">
            <h1>Giỏ Hàng Của Bạn</h1>
            <p>Bạn có thể đặt nhiều nhà hàng cùng một lúc. Mọi thứ đã sẵn sàng để thanh toán!</p>
        </div>

        <div className="gp-cart-container">
            {/* LEFT COLUMN: LIST */}
            <div className="gp-cart-left">
                {groups.map((group) => (
                    <div className="gp-cart-group-card" key={group.restaurantId || group.restaurantName}>
                        
                        <div className="gp-cart-group-header">
                            <div className="gp-cart-group-title" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input 
                                    type="checkbox" 
                                    style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#c90000'}} 
                                    checked={selectedShops.includes(group.restaurantId)} 
                                    onChange={() => toggleShop(group.restaurantId)} 
                                />
                                <h3><i className="bi bi-shop"></i> {group.restaurantName}</h3>
                                <span className="gp-badge-premium">
                                    <i className="bi bi-star-fill"></i> {Number(group.ratingAverage || 5).toFixed(1)}
                                </span>
                            </div>
                            <Link to={`/restaurant/${group.restaurantSlug}/book-table`} className="gp-cart-group-checkout">
                                <i className="bi bi-geo-alt"></i> Đặt bàn ngay
                            </Link>
                        </div>

                        <div className="gp-cart-item-list">
                            {group.products.map((item, index) => (
                                <div className="gp-cart-item" key={`${item.product_id}-${index}`}>
                                    <img src={item.productInfo?.img || "https://images.unsplash.com/photo-1544025162-8111142154ea?w=100&q=80"} alt={item.productInfo?.name} className="gp-cart-item-img" />
                                    
                                    <div className="gp-cart-item-info">
                                        <Link to={`/products/detail/${item.productInfo?.slug}`} className="gp-cart-item-name">
                                            {item.productInfo?.name}
                                        </Link>
                                        <p className="gp-cart-item-desc">
                                            {item.productInfo?.description?.substring(0, 40) || "Tùy chọn đặc biệt"}...
                                        </p>
                                    </div>
                                    
                                    <div className="gp-cart-item-price">
                                        {formatCurrency(item.productInfo?.price || 0)}
                                    </div>
                                    
                                    <div className="gp-cart-qty-control">
                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1 || updatingItemId === item.product_id}>
                                            {updatingItemId === item.product_id ? <span className="spinner-border spinner-border-sm" style={{width: '12px', height: '12px', borderWidth: '0.15em'}}></span> : <i className="bi bi-dash"></i>}
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} disabled={updatingItemId === item.product_id}>
                                            {updatingItemId === item.product_id ? <span className="spinner-border spinner-border-sm" style={{width: '12px', height: '12px', borderWidth: '0.15em'}}></span> : <i className="bi bi-plus"></i>}
                                        </button>
                                    </div>

                                    <div className="gp-cart-item-total">
                                        {formatCurrency(calculateLineTotal(item))}
                                    </div>

                                    <button 
                                        className="gp-cart-item-remove"
                                        onClick={() => handleRemove(item.product_id)}
                                        title="Xóa món ăn"
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* RIGHT COLUMN: SUMMARY */}
            <div className="gp-cart-right">
                <div className="gp-cart-summary-card">
                    <h3>Tổng Kết Đơn Hàng</h3>
                    
                    <div className="gp-summary-line">
                        <span>Số lượng nhà hàng</span>
                        <strong>{selectedShops.length} Shop</strong>
                    </div>
                    <div className="gp-summary-line">
                        <span>Tổng số món ăn</span>
                        <strong>{selectedTotalQuantity} Món</strong>
                    </div>
                    
                    <div className="gp-summary-divider"></div>
                    
                    <div className="gp-summary-total">
                        <span>Tạm tính</span>
                        <strong className="gp-text-red">{formatCurrency(selectedTotalPrice)}</strong>
                    </div>

                    <button 
                        onClick={() => {
                            if (selectedShops.length === 0) {
                                notifyApp("Vui lòng chọn ít nhất 1 nhà hàng", "warning");
                                return;
                            }
                            navigate(`/cart/checkout?shops=${selectedShops.join(",")}`);
                        }}
                        className="gp-btn-primary full-width"
                        style={{border: 'none', padding: '15px'}}
                    >
                        Tiến Hành Thanh Toán <i className="bi bi-arrow-right-circle"></i>
                    </button>

                    <p className="gp-summary-note">
                        <i className="bi bi-shield-check"></i> Thanh toán an toàn, bảo mật tuyệt đối. Phí giao hàng sẽ được tính ở bước tiếp theo.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
