import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCurrency, formatDateTime } from "../../utils/shop";

function OrderSuccess() {
  const { orderId } = useParams();
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    fetch(`/api/checkout/success/${orderId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPayload(data))
      .catch(() => setPayload(null));
  }, [orderId]);

  const orders = useMemo(() => {
    if (!payload) return [];
    if (payload.type === "group") return payload.orders || [];
    if (payload.order) return [payload.order];
    return [];
  }, [payload]);

  const total = useMemo(
    () => orders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    [orders]
  );

  if (!payload || orders.length === 0) {
    return null;
  }

  return (
    <section className="success-shell">
      <article className="success-card">
        <div className="success-icon">
          <i className="bi bi-check2-circle" />
        </div>
        <p className="eyebrow">Dat hang thanh cong</p>
        <h1>Yeu cau cua ban da duoc ghi nhan.</h1>
        <p>
          {payload.orderGroupCode ? `Nhom don ${payload.orderGroupCode}` : `Don ${orders[0].orderId}`} duoc tao luc {formatDateTime(orders[0].createdAt)}.
        </p>

        <div className="success-summary">
          <div className="summary-row">
            <span>So nha hang</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="summary-row">
            <span>Tong tien</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          {orders.map((order) => (
            <div className="summary-row" key={order._id}>
              <span>{order.restaurantInfo?.name || order.orderId}</span>
              <strong>
                {order.orderType === "delivery" ? "Ship" : "Dat ban"} • {formatCurrency(order.totalAmount || 0)}
              </strong>
            </div>
          ))}
        </div>

        <div className="button-row">
          <Link to="/" className="secondary-button no-underline ">
            Ve trang chu
          </Link>
          <Link to="/cart/doneOrder" className="primary-button no-underline ">
            Xem lich su don
          </Link>
        </div>
      </article>
    </section>
  );
}

export default OrderSuccess;
