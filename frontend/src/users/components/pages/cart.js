import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import { calculateLineTotal, formatCurrency } from "../../utils/shop";
import FeaturedProducts from "../MainContents/products/featuredProducts";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import LoadingButtonMini from "../mixi/LoadingButtonMini";

export default function CartPage() {
  const { cartItems, totalQuantity, fetchCart, loading, updateQuantity } = useCart();
  const navigate = useNavigate();

  const groups = Array.isArray(cartItems?.restaurantGroups) ? cartItems.restaurantGroups : [];
  console.log("groups", groups)
  const handleRemove = async (id) => {
    const res = await fetch(`/api/cart/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 401) {
      notifyApp("Vui long dang nhap de thao tac voi gio hang", "info");
      navigate("/user/auth/login");
      return;
    }

    if (res.ok) {
      await fetchCart();
      notifyApp("Da xoa san pham khoi gio hang", "success");
      return;
    }

    notifyApp("Khong the xoa san pham khoi gio hang", "error");
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const success = await updateQuantity(productId, newQuantity);
    if (success) {
      notifyApp("Cap nhat so luong thanh cong", "success");
    } else {
      notifyApp("Khong the cap nhat so luong", "error");
    }
  };

  if (loading) {
    return <p>Dang tai gio hang...</p>;
  }

  if (!groups.length) {
    return (
      <div className="page-stack">
        <section className="success-shell">
          <article className="success-card">
            <div className="success-icon">
              <i className="bi bi-cart-x" />
            </div>
            <p className="eyebrow">Gio hang trong</p>
            <h1>Ban chua them mon an nao.</h1>

            <div className="empty-state-actions">
              <Link to="/products" className="primary-button no-underline ">
                Xem san pham
              </Link>
              <Link to="/" className="secondary-button no-underline ">
                Ve trang chu
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
          <p className="eyebrow">Gio hang cua ban</p>
          <h2 className="eyebrow">Bạn có thể đặt nhiều nhà hàng trong 1 lân thanh toán</h2>
        </div>
      </div>

      <div className="page-stack">
        {groups.map((group) => (
          <div className="table-card" key={group.restaurantId || group.restaurantName}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{group.restaurantName}</p>
                <h3>{group.totalQuantity} mon - {formatCurrency(group.totalAmount)}</h3>
              </div>
              <div className="admin-muted">
                {Number(group.ratingAverage || 0).toFixed(1)} sao • {group.orderCount || 0} luot mua
              </div>
              <div>
                <Link to={`/cart/checkoutshop?shop=${group.restaurantId}`} className=" no-underline" style={{color:"blue"}}>
                  Mua Ngay
                </Link>
              </div>


            </div>

            <div className="order-list">
              {group.products.map((item, index) => (
                <article className="order-item" key={`${item.product_id}-${index}`}>
                  <img src={item.productInfo?.img} alt={item.productInfo?.name} />
                  <div className="order-item-copy">
                    <Link to={`/products/detail/${item.productInfo?.slug}`}>
                      {item.productInfo?.name}
                    </Link>
                    <div className="admin-muted">
                      <span>
                        {new Date(item.productInfo.createdAt).toLocaleString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="quantity-controls">
                      <LoadingButtonMini
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </LoadingButtonMini>
                      <span>{item.quantity}</span>
                      <LoadingButtonMini
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      >
                        +
                      </LoadingButtonMini>
                    </div>
                  </div>
                  <strong>{formatCurrency(calculateLineTotal(item))}</strong>
                  <LoadingButtonMini
                    onClick={() => handleRemove(item.product_id)}
                    // isLoading={loadingStatusIds.has(item._id)}
                    loadingText="..."
                    variant="ghost"
                    style={{
                      color: item.status === "active" ? "green" : "red",
                      padding: "4px 8px",
                      border: "none",
                      background: "none",
                    }}
                  >Xoa</LoadingButtonMini>
                  {/* <button type="button" className="danger-link" >
                    
                  </button> */}
                </article>
              ))}
            </div>
          </div>
        ))}

        <aside className="summary-card">
          <h3>Tong ket don hang</h3>

          <div className="summary-row">
            <span>So mon</span>
            <strong>{totalQuantity}</strong>
          </div>
          <div className="summary-row">
            <span>So nha hang</span>
            <strong>{groups.length}</strong>
          </div>
          <div className="summary-row">
            <span>Tam tinh</span>
            <strong>{formatCurrency(cartItems?.totalCartPrice)}</strong>
          </div>

          <Link to="/cart/checkout" className="primary-button full-width no-underline ">
            Di den thanh toan
          </Link>
        </aside>
      </div>
    </section>
  );
}
