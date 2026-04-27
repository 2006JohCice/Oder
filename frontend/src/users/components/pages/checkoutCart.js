import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import {
  calculateLineTotal,
  DINING_AREAS,
  formatCurrency,
  TABLE_OPTIONS,
} from "../../utils/shop";
import FeaturedProducts from "../MainContents/products/featuredProducts";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

const defaultForm = {
  fullName: "",
  phone: "",
  address: "",
  orderType: "dine_in",
  tableInfo: {
    area: DINING_AREAS[0],
    tableNumber: TABLE_OPTIONS[0],
    guestCount: 2,
    arrivalTime: "",
    note: "",
  },
};

export default function CheckoutCart() {
  const [cartItems, setCartItems] = useState({});
  const [formData, setFormData] = useState(defaultForm);
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();

  useEffect(() => {
    if (new URLSearchParams(location.search).get("mode") === "table") {
      setFormData((prev) => ({ ...prev, orderType: "dine_in" }));
    }
  }, [location.search]);

  useEffect(() => {
    const loadCart = async () => {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        navigate("/user/auth/login");
        return;
      }

      const data = await res.json();
      setCartItems(data);
    };

    loadCart();
  }, [navigate]);

  const products = Array.isArray(cartItems?.products) ? cartItems.products : [];
  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      tableInfo: {
        ...prev.tableInfo,
        [name]: name === "guestCount" ? Number(value) : value,
      },
    }));
  };

  const handleDonePay = async (event) => {
    event.preventDefault();

    const res = await fetch("/api/checkout/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.status === 401) {
      notifyApp("Vui lòng đăng nhập để đặt hàng", "info");
      navigate("/user/auth/login");
      return;
    }

    const data = await res.json();
    if (!res.ok) {
      notifyApp(data.message, "error");
      return;
    }

    await fetchCart();
    notifyApp("Đặt hàng thành công", "success");
    navigate(`/cart/checkout/success/${data.orderId}`);
  };

  if (products.length === 0) {
    return (
      <div className="page-stack">
        <section className="success-shell">
          <article className="success-card">
            <div className="success-icon">
              <i className="bi bi-basket3" />
            </div>
            <p className="eyebrow">Chưa thể thanh toán</p>
            <h1>Giỏ hàng hiện đang trống.</h1>
            <p>Vui lòng thêm món ăn trước khi đi đến bước thanh toán hoặc đặt bàn.</p>
            <div className="empty-state-actions">
              <Link to="/products" className="primary-button no-underline ">
                Đi tới sản phẩm
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
          <p className="eyebrow">Thanh toán mới</p>
          <h2>Thanh toán nhanh và giữ bàn ngay trong cùng một màn hình</h2>
        </div>
      </div>

      <div className="order-layout">
        <div className="table-card">
          <div className="order-list">
            {products.map((item, index) => (
              <article className="order-item" key={`${item.product_id}-${index}`}>
                <img src={item.productInfo?.img} alt={item.productInfo?.name} />
                <div className="order-item-copy">
                  <strong>{item.productInfo?.name}</strong>
                  <span>Số lượng: {item.quantity}</span>
                </div>
                <strong>{formatCurrency(calculateLineTotal(item))}</strong>
              </article>
            ))}
          </div>
        </div>

        <form className="summary-card checkout-form" onSubmit={handleDonePay}>
          <div className="toggle-row">
            <button
              type="button"
              className={formData.orderType === "dine_in" ? "toggle active" : "toggle"}
              onClick={() => setFormData((prev) => ({ ...prev, orderType: "dine_in" }))}
            >
              Ăn tại bàn
            </button>
            <button
              type="button"
              className={formData.orderType === "delivery" ? "toggle active" : "toggle"}
              onClick={() => setFormData((prev) => ({ ...prev, orderType: "delivery" }))}
            >
              Giao tận nơi
            </button>
          </div>

          <div className="form-grid">
            <label>
              Họ và tên
              <input name="fullName" value={formData.fullName} onChange={handleChange} required />
            </label>
            <label>
              Số điện thoại
              <input name="phone" value={formData.phone} onChange={handleChange} required />
            </label>

            {formData.orderType === "delivery" && (
              <label className="field-span">
                Địa chỉ giao hàng
                <input name="address" value={formData.address} onChange={handleChange} required />
              </label>
            )}

            {formData.orderType === "dine_in" && (
              <>
                <label>
                  Khu vực
                  <select name="area" value={formData.tableInfo.area} onChange={handleTableChange}>
                    {DINING_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Số bàn
                  <select
                    name="tableNumber"
                    value={formData.tableInfo.tableNumber}
                    onChange={handleTableChange}
                  >
                    {TABLE_OPTIONS.map((table) => (
                      <option key={table} value={table}>
                        {table}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Số khách
                  <input
                    type="number"
                    min="1"
                    name="guestCount"
                    value={formData.tableInfo.guestCount}
                    onChange={handleTableChange}
                  />
                </label>
                <label>
                  Giờ đến dự kiến
                  <input
                    type="time"
                    name="arrivalTime"
                    value={formData.tableInfo.arrivalTime}
                    onChange={handleTableChange}
                  />
                </label>
                <label className="field-span">
                  Ghi chú bàn ăn
                  <textarea
                    rows="3"
                    name="note"
                    value={formData.tableInfo.note}
                    onChange={handleTableChange}
                    placeholder="Sinh nhật, gần cửa sổ, thêm ghế em bé..."
                  />
                </label>
              </>
            )}
          </div>

          <div className="summary-row">
            <span>Tổng số lượng</span>
            <strong>{totalQuantity}</strong>
          </div>
          <div className="summary-row">
            <span>Tổng tiền</span>
            <strong>{formatCurrency(cartItems?.totalCartPrice)}</strong>
          </div>
          <button className="primary-button full-width" type="submit">
            Xác nhận đơn hàng
          </button>
        </form>
      </div>
    </section>
  );
}
