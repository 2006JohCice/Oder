import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime, getOrderTotal } from "../../utils/shop";

function DoneOrder() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/checkout/doneOrder")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lịch Sử Đơn Hàng</p>
          <h2>Theo Dõi Đơn Hàng & Thông Tin Bàn Ăn</h2>
        </div>
      </div>

      <div className="history-grid">
        {orders.map((order) => (
          <article className="history-card" key={order._id}>
            <div className="history-card-top">
              <span className={`status-pill ${order.orderStatus}`}>{order.orderStatus}</span>
              <strong>{order.orderId}</strong>
            </div>
            <p>{formatDateTime(order.createdAt)}</p>
            <p>Loai don: {order.orderType === "delivery" ? "Giao hang" : "An tai ban"}</p>
            {order.tableInfo?.tableNumber && (
              <p>
                Bàn {order.tableInfo.tableNumber} - {order.tableInfo.area} - {order.tableInfo.guestCount} khach
              </p>
            )}
            <strong>{formatCurrency(getOrderTotal(order.products))}</strong>
            <Link to={`/cart/checkout/success/${order._id}`} className="secondary-button full-width no-underline ">
              Xem chi tiết
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DoneOrder;
