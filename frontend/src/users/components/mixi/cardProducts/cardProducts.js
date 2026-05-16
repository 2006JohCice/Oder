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
    console.log("nó ở đây",productId, redirectToCheckout );
    
    if (addingProductId === productId) return;
    setAddingProductId(productId);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (res.status === 401) {
        notifyApp("Vui long dang nhap de them san pham vao gio hang", "info");
        navigate("/user/auth/login");
        return;
      }

      const result = await res.json().catch(() => ({}))
      if (res.ok) {
        await fetchCart();
        notifyApp(result.message || "Da them san pham vao gio hang", "success");
        if (redirectToCheckout) {
          navigate("/cart/checkout");
        }
        return;
      }

      notifyApp(result.message || "Khong the them san pham vao gio hang", "error");
    } finally {
      setAddingProductId(null);
    }
  };

  if (!Array.isArray(data) || data.length === 0) {
    return <CardLoading />;
  }

  return (
    <div className="product-grid">
      {data.map((product) => {
        const isAdding = addingProductId === product._id;

        return (
          <article className="product-card" key={product._id}>
            <div className="product-image">
              <img src={product.img} alt={product.name} />
              {product.featured === "1" && <span className="product-tag">Noi bat</span>}
            </div>

            <div className="product-info">
              <div className="product-meta">
                <span>{product.stock > 0 ? "San sang phuc vu" : "Tam het"}</span>
                <span>{product.restaurantInfo?.name || product.slug}</span>
              </div>

              <Link to={`/products/detail/${product.slug}`} className="product-name">
                {product.name}
              </Link>

              <p className="product-description">
                {product.description || "Mon an duoc trinh bay gon gang, phu hop cho dat ship hoac dat ban."}
              </p>

              {product.restaurantInfo && (
                <div className="product-meta">
                  <span>{Number(product.restaurantInfo.ratingAverage || 0).toFixed(1)} sao</span>
                  <span>{product.restaurantInfo.orderCount || 0} luot mua</span>
                </div>
              )}

              <div className="product-footer">
                <strong className="product-price">{formatCurrency(product.price)}</strong>
                <div className="product-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={isAdding}
                  >
                    {isAdding ? "Dang them..." : "Them gio"}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleAddToCart(product._id, true)}
                    disabled={isAdding}
                  >
                    {isAdding ? "Dang xu ly..." : "Mua ngay"}
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
