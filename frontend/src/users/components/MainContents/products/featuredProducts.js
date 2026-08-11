import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../mixi/cart/CartContext";
import { notifyApp } from "../../../../shared/notifications/ToastProvider";
import { isRestaurantClosed } from "../../../utils/shop";
import "../../../css/FeaturedAward.css"; 


function FeaturedProducts({ isWidget = false }) {
  const [featured, setFeatured] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/products/featured")
      .then((res) => res.json())
      .then((res) => {
        setFeatured(res.data || []);
      })
      .catch(() => {
        setFeatured([]);
      });
  }, []);

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    const isClosed = isRestaurantClosed(product.restaurantInfo?.openTime, product.restaurantInfo?.closeTime);
    if (isClosed) {
        notifyApp("Nhà hàng đã đóng cửa", "info");
        return;
    }

    try {
        await addToCart(product._id, 1, [], "");
        notifyApp("Đã thêm món vào giỏ hàng", "success");
    } catch (error) {
        if (error.message && error.message.includes("Login required")) {
            notifyApp("Vui lòng đăng nhập để thêm món", "info");
            navigate("/user/auth/login");
        } else if (error.message && error.message.includes("Different restaurant")) {
            notifyApp("Vui lòng thanh toán đơn hàng trước khi đặt món ở nhà hàng khác", "warning");
        } else {
            notifyApp(error.message || "Lỗi khi thêm vào giỏ hàng", "error");
        }
    }
  };

  if (!featured || featured.length === 0) {
      return null;
  }

  const top1Product = featured[0];
  const topHonorProducts = featured.slice(1, 5);

  if (isWidget) {
      return (
          <div className="gp-fa-honor-grid" style={{ marginTop: '20px' }}>
              {featured.slice(0, 4).map((product, index) => {
                  const rSlug = product.restaurantInfo?.slug || 'default';
                  const isClosed = isRestaurantClosed(product.restaurantInfo?.openTime, product.restaurantInfo?.closeTime);
                  return (
                  <Link to={`/restaurant/${rSlug}/products/detail/${product.slug}`} key={product._id} className="gp-fa-light-card">
                      <div className="gp-fa-light-img">
                          <img src={product.img} alt={product.name} style={isClosed ? { filter: "grayscale(100%)" } : {}} />
                          <button 
                            className="gp-fa-light-add" 
                            onClick={(e) => handleAddToCart(product, e)} 
                            title={isClosed ? "Đóng cửa" : "Thêm vào giỏ"}
                            disabled={isClosed}
                            style={isClosed ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                          >
                              <i className="bi bi-cart-plus"></i>
                          </button>
                      </div>
                      <div className="gp-fa-light-body">
                          <h4 className="gp-fa-light-name">{product.name}</h4>
                          <p className="gp-fa-light-rest"><i className="bi bi-shop"></i> {product.restaurantInfo?.name || "Nhà hàng Ẩm Thực"}</p>
                          <div className="gp-fa-light-footer">
                              <div className="gp-fa-light-rating">
                                  <span className="gp-stock-badge">
                                      {product.stock > 0 ? `Còn ${product.stock} suất` : 'Hết hàng'}
                                  </span>
                              </div>
                              <div className="gp-fa-light-orders">
                                  <i className="bi bi-check-circle-fill"></i> Đã bán {product.soldCount || 0}
                              </div>
                          </div>
                      </div>
                  </Link>
              )})}
          </div>
      );
  }

  return (
    <div className="gp-fa-page-wrapper">
      <div className="gp-fa-premium-section">
          
        {/* HEADER */}
        <div className="gp-fa-premium-header">
            <div className="gp-fa-glow-badge"><i className="bi bi-star-fill"></i> GIẢI THƯỞNG THƯỜNG NIÊN <i className="bi bi-star-fill"></i></div>
            <h1 className="gp-fa-gold-title">Tinh Hoa Ẩm Thực</h1>
            <h2 className="gp-fa-gold-subtitle">GOURMET PULSE 2024</h2>
            <div className="gp-fa-divider"></div>
            <p className="gp-fa-premium-desc">
                Tôn vinh những tuyệt tác ẩm thực xuất sắc nhất năm. Bảng xếp hạng dựa trên 
                <span className="text-red-bold"> số liệu đơn đặt hàng thực tế </span> 
                và đánh giá chân thực từ cộng đồng người sành ăn.
            </p>
        </div>

        {/* TOP 1: MASTERPIECE */}
        {top1Product && (
            <div className="gp-fa-masterpiece">
                <div className="gp-fa-masterpiece-header">
                    <img src="https://cdn-icons-png.flaticon.com/512/5406/5406792.png" alt="Trophy" className="gp-fa-trophy-icon"/>
                    <h3>TOP 1: MÓN ĂN QUỐC DÂN</h3>
                </div>
                
                <div className="gp-fa-masterpiece-card">
                    {/* Background Image (Full width) */}
                    <div className="gp-fa-mp-bg">
                        <img 
                          src={top1Product.img || "https://images.unsplash.com/photo-1544025162-8111149c4021?auto=format&fit=crop&w=1200&q=80"} 
                          alt={top1Product.name} 
                          style={isRestaurantClosed(top1Product.restaurantInfo?.openTime, top1Product.restaurantInfo?.closeTime) ? { filter: "grayscale(100%)" } : {}} 
                        />
                        <div className="gp-fa-mp-overlay"></div>
                    </div>

                    {/* Content */}
                    <div className="gp-fa-mp-content">
                        <div className="gp-fa-mp-info">
                            <div className="gp-fa-tags">
                                <span className="gp-tag-gold">SIÊU CAO CẤP</span>
                                <span className="gp-tag-red"><i className="bi bi-fire"></i> MÓN VUA</span>
                            </div>
                            <h2 className="gp-fa-mp-name">{top1Product.name}</h2>
                            <p className="gp-fa-mp-desc">
                                {top1Product.description?.substring(0, 150) || "Sự kết hợp hoàn hảo giữa kỹ thuật chế biến truyền thống đỉnh cao và nguồn nguyên liệu thượng hạng tươi ngon nhất."}
                            </p>
                            <Link to={`/restaurant/${top1Product.restaurantInfo?.slug || 'default'}/products/detail/${top1Product.slug}`} className="gp-fa-mp-btn">
                                THỬ NGAY MÓN VUA <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>

                        <div className="gp-fa-mp-stats-glass">
                            <div className="gp-fa-stat-box">
                                <span>TỔNG LƯỢT ĐẶT</span>
                                <strong className="text-red-stat">{top1Product.soldCount || 0} <i className="bi bi-graph-up-arrow"></i></strong>
                            </div>
                            <div className="gp-fa-stat-box">
                                <span>TRẠNG THÁI</span>
                                <strong>{top1Product.status === 'active' ? "Đang phục vụ" : "Tạm ngưng"}</strong>
                            </div>
                            <div className="gp-fa-stat-box no-border">
                                <span>VUA ĐẦU BẾP (NHÀ HÀNG)</span>
                                <strong className="text-dark">{top1Product.restaurantInfo?.name || "The Prime Steakhouse"}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* BẢNG VÀNG DANH DỰ (TOP 2 - TOP 5) */}
        {topHonorProducts.length > 0 && (
            <div className="gp-fa-honor-section">
                <div className="gp-fa-honor-title-box">
                    <h3>BẢNG VÀNG DANH DỰ</h3>
                    <div className="gp-fa-divider-small"></div>
                </div>

                <div className="gp-fa-honor-grid">
                    {topHonorProducts.map((product, index) => {
                        const rSlug = product.restaurantInfo?.slug || 'default';
                        const isClosed = isRestaurantClosed(product.restaurantInfo?.openTime, product.restaurantInfo?.closeTime);
                        return (
                        <Link to={`/restaurant/${rSlug}/products/detail/${product.slug}`} key={product._id} className="gp-fa-light-card">
                            <div className="gp-fa-light-img">
                                <img src={product.img} alt={product.name} style={isClosed ? { filter: "grayscale(100%)" } : {}} />
                                <div className="gp-fa-rank-badge">#{index + 2}</div>
                                <button 
                                  className="gp-fa-light-add" 
                                  onClick={(e) => handleAddToCart(product, e)} 
                                  title={isClosed ? "Đóng cửa" : "Thêm vào giỏ"}
                                  disabled={isClosed}
                                  style={isClosed ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                >
                                    <i className="bi bi-cart-plus"></i>
                                </button>
                            </div>
                            <div className="gp-fa-light-body">
                                <h4 className="gp-fa-light-name">{product.name}</h4>
                                <p className="gp-fa-light-rest"><i className="bi bi-shop"></i> {product.restaurantInfo?.name || "Nhà hàng Ẩm Thực"}</p>
                                
                                <div className="gp-fa-light-footer">
                                    <div className="gp-fa-light-rating">
                                        <span className="gp-stock-badge">
                                            {product.stock > 0 ? `Còn ${product.stock} suất` : 'Hết hàng'}
                                        </span>
                                    </div>
                                    <div className="gp-fa-light-orders">
                                        <i className="bi bi-check-circle-fill"></i> Đã bán {product.soldCount || 0}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )})}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default FeaturedProducts;
