import { useState } from "react";
import { formatCurrency, isRestaurantClosed } from "../../../utils/shop";
import { useCart } from "../../mixi/cart/CartContext";
import { notifyApp } from "../../../../shared/notifications/ToastProvider";

function DetailCardProducts({ data }) {
  const { fetchCart } = useCart();
  const [addingProductId, setAddingProductId] = useState(null);

  const handleAddToCart = async (product) => {
    const isClosed = isRestaurantClosed(product.restaurantInfo?.openTime, product.restaurantInfo?.closeTime);
    if (isClosed) {
      notifyApp("Nhà hàng đã đóng cửa", "info");
      return;
    }
    
    if (addingProductId === product._id) return;
    setAddingProductId(product._id);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      if (res.status === 401) {
        notifyApp("Vui lòng đăng nhập để thêm món", "info");
        return;
      }

      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        await fetchCart();
        notifyApp(result.message || "Đã thêm vào giỏ", "success");
      } else {
        notifyApp(result.message || "Lỗi", "error");
      }
    } finally {
      setAddingProductId(null);
    }
  };

  if (!data || data.length === 0) return <div style={{color: '#718096', padding: '20px 0'}}>Chưa có món ăn nào trong danh mục này.</div>;

  return (
    <div className="gp-list-view-container">
      {data.map((product) => {
        const isSoldOut = product.stock <= 0;
        const isClosed = isRestaurantClosed(product.restaurantInfo?.openTime, product.restaurantInfo?.closeTime);

        return (
          <div key={product._id} className={`gp-list-card ${isSoldOut ? 'gp-sold-out' : ''}`}>
            {/* Left: Product Info */}
            <div className="gp-lc-info">
              <h4 className="gp-lc-title">{product.name}</h4>
              <p className="gp-lc-desc line-clamp-2">{product.description || "Hương vị truyền thống, đậm đà khó quên. Được chế biến từ nguyên liệu tươi sạch 100%."}</p>
              
              <div className="gp-lc-bottom">
                  <span className="gp-lc-price">{formatCurrency(product.price)}</span>
                  <span className="gp-lc-sold">Đã bán 1.2k+</span>
              </div>
            </div>

            {/* Right: Image & Action */}
            <div className="gp-lc-media">
                <div className="gp-lc-img-box">
                    <img src={product.img} alt={product.name} style={isClosed ? { filter: "grayscale(100%)" } : {}} />
                </div>
                <button 
                  className={`gp-lc-add-btn ${addingProductId === product._id ? 'loading' : ''}`}
                  onClick={() => handleAddToCart(product)} 
                  disabled={isSoldOut || addingProductId === product._id || isClosed}
                  style={isClosed ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  {addingProductId === product._id ? <span className="spinner-border spinner-border-sm"></span> : (isClosed ? <><i className="bi bi-clock"></i> Đóng cửa</> : <><i className="bi bi-plus-circle-fill"></i> Thêm</>)}
                </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DetailCardProducts;
