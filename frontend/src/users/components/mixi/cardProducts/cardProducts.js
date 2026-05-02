import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { formatCurrency } from "../../../utils/shop";
import { notifyApp } from "../../../../shared/notifications/ToastProvider";
import CardLoading from "../CardLoading";

function CardProducts({ data }) {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [addingProductId, setAddingProductId] = useState(null);

  const handleAddToCart = async (productId, redirectToCheckout = false) => {
    if (addingProductId === productId) return;

    setAddingProductId(productId);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (res.status === 401) {
        notifyApp("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "info");
        navigate("/user/auth/login");
        return;
      }

      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        await fetchCart();
        notifyApp(result.message || "Đã thêm sản phẩm vào giỏ hàng", "success");
        if (redirectToCheckout) {
          navigate("/cart/checkout");
        }
        return;
      }

      notifyApp(result.message || "Không thể thêm sản phẩm vào giỏ hàng", "error");
    } finally {
      setAddingProductId(null);
    }
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      
        <CardLoading/>
    
    );
  }

  return (
    <div className="product-grid">
      {data.map((product) => {
        const isAdding = addingProductId === product._id;

        return (
          <article className="product-card" key={product._id}>
            <div className="product-image">
              <img src={product.img} alt={product.name} />
              {product.featured === "1" && <span className="product-tag">Nổi bật</span>}
            </div>

            <div className="product-info">
              <div className="product-meta">
                <span>{product.stock > 0 ? "Sẵn sàng phục vụ" : "Tạm hết"}</span>
                <span>{product.slug}</span>
              </div>

              <Link to={`/products/detail/${product.slug}`} className="product-name">
                {product.name}
              </Link>

              <p className="product-description">
                {product.description || "Món ăn được trình bày gọn gàng, phù hợp cho order tại bàn."}
              </p>

              <div className="product-footer">
                <strong className="product-price">{formatCurrency(product.price)}</strong>
                <div className="product-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={isAdding}
                  >
                    {isAdding ? "Đang thêm..." : "Thêm giỏ"}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleAddToCart(product._id, true)}
                    disabled={isAdding}
                  >
                    {isAdding ? "Đang xử lý..." : "Mua ngay"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default CardProducts;
