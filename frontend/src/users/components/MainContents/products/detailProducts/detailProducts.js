import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FeaturedProducts from "../../../MainContents/products/featuredProducts";
import { useCart } from "../../../mixi/cart/CartContext";
import { formatCurrency } from "../../../../utils/shop";
import { notifyApp } from "../../../../../shared/notifications/ToastProvider";
import CardProducts from "../../../mixi/cardProducts/cardProducts";

function ProductDetail() {
  const navigate = useNavigate();
  const { slugProduct } = useParams();
  const { fetchCart } = useCart();
  const [detailProduct, setDetailProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/products/detail/${slugProduct}`)
      .then((res) => res.json())
      .then((data) => setDetailProduct(data))
      .catch(() => setDetailProduct(null));
  }, [slugProduct]);

  const handleAddToCart = async (goCheckout = false) => {
    if (!detailProduct?._id || isAdding) return;

    setIsAdding(true);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        navigate(goCheckout ? "/cart/checkout?mode=table" : "/cart");
        return;
      }

      notifyApp(result.message || "Không thể thêm món ăn", "error");
    } finally {
      setIsAdding(false);
    }
  };

  if (!detailProduct) {

    return(
      <>
      <CardProducts/>

      <FeaturedProducts />
      </>
      
    ) 
  }

  return (
    <div className="page-stack">
      <section className="detail-shell">
        <div className="detail-media">
          <img src={detailProduct.img} alt={detailProduct.name} />
        </div>

        <div className="detail-content">
          <p className="eyebrow">Chi tiết món ăn</p>
          <h1>{detailProduct.name}</h1>
          <p className="detail-price">{formatCurrency(detailProduct.price)}</p>
          <p className="detail-description">
            {detailProduct.description || "Món ăn phù hợp cho đặt bàn, tiệc nhỏ và bữa tối gia đình."}
          </p>

          <div className="detail-stat-grid">
            <article>
              <span>Tồn kho</span>
              <strong>{detailProduct.stock || "Còn phục vụ"}</strong>
            </article>
            <article>
              <span>Trạng thái</span>
              <strong>{detailProduct.deleted ? "Tạm dừng" : "Đang bán"}</strong>
            </article>
            <article>
              <span>Danh mục</span>
              <strong>{detailProduct.category || "Nhà hàng"}</strong>
            </article>
          </div>

          <div className="quantity-picker">
            <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
              -
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((prev) => prev + 1)}>
              +
            </button>
          </div>

          <div className="detail-actions">
            <button type="button" className="ghost-button" onClick={() => handleAddToCart(false)} disabled={isAdding}>
              {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
            <button type="button" className="primary-button" onClick={() => handleAddToCart(true)} disabled={isAdding}>
              {isAdding ? "Đang xử lý..." : "Đặt bàn cùng món này"}
            </button>
          </div>
        </div>
      </section>

      <FeaturedProducts />
    </div>
  );
}

export default ProductDetail;
