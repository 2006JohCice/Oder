import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import FeaturedProducts from "../../../MainContents/products/featuredProducts";
import { useCart } from "../../../mixi/cart/CartContext";
import { formatCurrency } from "../../../../utils/shop";
import { notifyApp } from "../../../../../shared/notifications/ToastProvider";
import RestaurantReview from "../../../mixi/RestaurantReview/RestaurantReview";
import "../../../../css/DetailProducts.css";

function ProductDetail() {
  const navigate = useNavigate();
  const { restaurantSlug, slugProduct } = useParams();
  const { fetchCart } = useCart();
  const [detailProduct, setDetailProduct] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Options state
  const [selectedDoneness, setSelectedDoneness] = useState("Medium Rare");
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Auth state
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch product details
    fetch(`/api/products/detail/${slugProduct}`)
      .then((res) => res.json())
      .then((data) => setDetailProduct(data))
      .catch(() => setDetailProduct(null));

    // Fetch user to check login status
    fetch("/api/user/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, [slugProduct]);

  // Mock data for options if backend doesn't provide it
  const donenessOptions = ["Medium Rare", "Medium", "Medium Well", "Well Done"];
  const addonOptions = [
    { id: 1, name: "Khoai tây nghiền nấm Truffle", price: 45000, desc: "Béo ngậy, thơm nồng vị nấm đặc trưng." },
    { id: 2, name: "Măng tây nướng than hoa", price: 65000, desc: "Giòn ngọt tự nhiên." },
  ];

  // Calculate total price based on product base price + addons * quantity
  const basePrice = detailProduct?.price || 0;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = addonOptions.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);
  const totalPrice = (basePrice + addonsTotal) * quantity;

  // Mock Images
  const mockImages = [
    detailProduct?.img || "https://images.unsplash.com/photo-1544025162-8111142154ea?w=1920&q=80",
    "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1920&q=80",
    "https://images.unsplash.com/photo-1558030006-450675393462?w=1920&q=80"
  ];

  const handleToggleAddon = (id) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleAddToCart = async () => {
    if (!detailProduct?._id || isAdding) return;
    setIsAdding(true);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: detailProduct._id,
          quantity,
        }),
      });

      if (res.status === 401) {
        notifyApp("Vui lòng đăng nhập để thêm món ăn", "info");
        navigate("/user/auth/login");
        return;
      }

      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        await fetchCart();
        notifyApp(result.message || "Đã thêm món ăn vào giỏ hàng", "success");
      } else {
        notifyApp(result.message || "Không thể thêm món ăn", "error");
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (!detailProduct) {
    return (
      <div className="gp-premium-loading">
        <div className="spinner"></div>
        <p>Đang chuẩn bị mỹ vị...</p>
      </div>
    );
  }

  return (
    <div className="gp-pd-wrapper">
      
      {/* CINEMATIC HERO SECTION */}
      <div className="gp-pd-hero">
        <div className="gp-pd-hero-bg">
            <img src={mockImages[activeImage]} alt={detailProduct.name} />
            <div className="gp-pd-hero-overlay"></div>
        </div>

        <div className="gp-pd-hero-content">
            <div className="gp-pd-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="bi bi-chevron-right"></i>
                <Link to="/products">Thực đơn</Link>
                <i className="bi bi-chevron-right"></i>
                <span>{detailProduct.name}</span>
            </div>

            <span className="gp-pd-tag"><i className="bi bi-award-fill"></i> Premium Quality</span>
            <h1 className="gp-pd-title">{detailProduct.name}</h1>
            
            <div className="gp-pd-meta">
                <div className="gp-pd-meta-item">
                    <i className="bi bi-star-fill"></i> 4.9 (128 đánh giá)
                </div>
                <div className="gp-pd-meta-item" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <i className="bi bi-shop"></i> {detailProduct.restaurantInfo?.name || "The Prime Steakhouse"}
                    <Link to={`/restaurant/${restaurantSlug || detailProduct.restaurantInfo?.slug || 'default'}/book-table`} className="gp-pd-book-btn">
                        <i className="bi bi-calendar-check"></i> Đặt Bàn Ngay
                    </Link>
                </div>
            </div>
            
            <p className="gp-pd-desc">
                {detailProduct.description || "Thưởng thức hương vị béo ngậy, tan chảy trong miệng của thăn lưng bò Wagyu A5 Nhật Bản cao cấp. Mức độ vân mỡ hoàn hảo, nướng áp chảo tinh tế để giữ trọn vị ngọt bản thể."}
            </p>
        </div>

        {/* THUMBNAILS (Floating) */}
        <div className="gp-pd-thumbnails">
            {mockImages.map((img, idx) => (
              <div 
                key={idx} 
                className={`gp-pd-thumb ${activeImage === idx ? "active" : ""}`}
                onClick={() => setActiveImage(idx)}
              >
                  <img src={img} alt="thumbnail" />
              </div>
            ))}
        </div>
      </div>

      {/* MAIN CONTENT (Glassmorphism overlap) */}
      <div className="gp-pd-main-container">
          
          <div className="gp-pd-layout">
              {/* LEFT: REVIEWS & MORE INFO */}
              <div className="gp-pd-left">
                  
                  {/* Reviews Section */}
                  <div className="gp-pd-reviews">
                      <RestaurantReview restaurantId={detailProduct?.restaurant_id} readOnly={true} />
                  </div>
                  
                  {/* Related Products */}
                  <div className="gp-pd-related">
                      <h2>Gợi Ý Phù Hợp</h2>
                      <FeaturedProducts isWidget={true} />
                  </div>
              </div>

              {/* RIGHT: ORDER PANEL (Sticky) */}
              <div className="gp-pd-right">
                  <div className="gp-pd-order-panel">
                      
                      <div className="gp-pd-op-price">
                          <span className="label">Giá món ăn</span>
                          <span className="value">{formatCurrency(basePrice)}</span>
                      </div>

                      <div className="gp-pd-op-divider"></div>

                      {/* Options: Doneness */}
                      <div className="gp-pd-op-group">
                          <div className="gp-pd-op-head">
                              <h4>Độ chín <span>*Bắt buộc</span></h4>
                          </div>
                          <div className="gp-pd-pills">
                              {donenessOptions.map(opt => (
                                  <div 
                                      key={opt}
                                      className={`gp-pd-pill ${selectedDoneness === opt ? 'active' : ''}`}
                                      onClick={() => setSelectedDoneness(opt)}
                                  >
                                      {opt}
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Options: Add-ons */}
                      <div className="gp-pd-op-group">
                          <div className="gp-pd-op-head">
                              <h4>Món ăn kèm <span>*Tùy chọn</span></h4>
                          </div>
                          <div className="gp-pd-addons">
                              {addonOptions.map(addon => (
                                  <label className={`gp-pd-addon-item ${selectedAddons.includes(addon.id) ? 'selected' : ''}`} key={addon.id}>
                                      <div className="gp-pd-addon-info">
                                          <div className="gp-pd-addon-name">{addon.name}</div>
                                          <div className="gp-pd-addon-desc">{addon.desc}</div>
                                      </div>
                                      <div className="gp-pd-addon-action">
                                          <span className="price">+{formatCurrency(addon.price)}</span>
                                          <input 
                                              type="checkbox"
                                              checked={selectedAddons.includes(addon.id)}
                                              onChange={() => handleToggleAddon(addon.id)}
                                          />
                                      </div>
                                  </label>
                              ))}
                          </div>
                      </div>

                      <div className="gp-pd-op-divider"></div>

                      {/* Quantity & Add to Cart */}
                      <div className="gp-pd-total-row">
                          <div className="gp-pd-qty">
                              <button onClick={() => setQuantity(p => Math.max(1, p - 1))}><i className="bi bi-dash"></i></button>
                              <span>{quantity}</span>
                              <button onClick={() => setQuantity(p => p + 1)}><i className="bi bi-plus"></i></button>
                          </div>
                          <div className="gp-pd-final-price">
                              {formatCurrency(totalPrice)}
                          </div>
                      </div>

                      <button className="gp-pd-add-btn" onClick={handleAddToCart} disabled={isAdding}>
                          {isAdding ? "Đang xử lý..." : "Thêm Vào Giỏ Hàng"}
                      </button>

                  </div>
              </div>
          </div>
          
      </div>

    </div>
  );
}

export default ProductDetail;
