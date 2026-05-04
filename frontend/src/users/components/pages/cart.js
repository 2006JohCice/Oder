import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import { calculateLineTotal, formatCurrency } from "../../utils/shop";
import FeaturedProducts from "../MainContents/products/featuredProducts";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

export default function CartPage() {
  const { cartItems, totalQuantity, fetchCart, loading, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (id) => {
    const res = await fetch(`/api/cart/delete/${id}`, {
      method: "DELETE",
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
    const success = await updateQuantity(productId, newQuantity);
    if (success) {
      notifyApp("Cập nhật số lượng thành công", "success");
    } else {
      notifyApp("Không thể cập nhật số lượng", "error");
    }
  };

  if (loading) {
    return <p>Đang tải giỏ hàng...</p>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="page-stack">
        <section className="success-shell">
          <article className="success-card">
            <div className="success-icon">
              <i className="bi bi-cart-x" />
            </div>
            <p className="eyebrow">Giỏ hàng trống</p>
            <h1>Bạn chưa thêm món ăn nào.</h1>

            <div className="empty-state-actions">
              <Link to="/products" className="primary-button no-underline ">
                Xem sản phẩm
              </Link>
              <Link to="/" className="secondary-button no-underline ">
                Về trang chủ
              </Link>
            </div>
          </article>
        </section>

        <FeaturedProducts />
      </div>
    );
  }

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Giỏ hàng của bạn</p>
          <h2>Rà soát lại món trước khi đặt hàng</h2>
        </div>
      </div>

      <div className="order-layout">
        <div className="table-card">
          <div className="order-list">
            {cartItems.map((item, index) => (
              <article className="order-item" key={`${item.product_id}-${index}`}>
                <img src={item.productInfo?.img} alt={item.productInfo?.name} />
                <div className="order-item-copy">
                  <Link to={`/products/detail/${item.productInfo?.slug}`}>
                    {item.productInfo?.name}
                  </Link>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <strong>{formatCurrency(calculateLineTotal(item))}</strong>
                <button
                  type="button"
                  className="danger-link"
                  onClick={() => handleRemove(item.product_id)}
                >
                  Xóa
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="summary-card">
          <h3>Tổng kết đơn hàng</h3>

          <div className="summary-row">
            <span>Số món</span>
            <strong>{totalQuantity}</strong>
          </div>

          <Link to="/cart/checkout" className="primary-button full-width no-underline ">
            Đi đến thanh toán
          </Link>
        </aside>
      </div>
    </section>
  );
}