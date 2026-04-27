import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCurrency, formatDateTime, getOrderTotal } from "../../utils/shop";

function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/checkout/success/${orderId}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch(() => setOrder(null));
  }, [orderId]);

  const total = useMemo(() => getOrderTotal(order?.products || []), [order]);

  if (!order) {
    return null;
  }

  return (
    <section className="success-shell">
      <article className="success-card">
        <div className="success-icon">
          <i className="bi bi-check2-circle" />
        </div>
        <p className="eyebrow">Đặt hàng thành công</p>
        <h1>Đơn hàng đã được ghi nhận.</h1>
        <p>
          Mã đơn {order.orderId} được tạo lúc {formatDateTime(order.createdAt)}. Trạng thái hiện tại:
          {" "}
          <strong>{order.orderStatus}</strong>.
        </p>

        <div className="success-summary">
          <div className="summary-row">
            <span>Khách hàng</span>
            <strong>{order.userInfo?.fullName}</strong>
          </div>
          <div className="summary-row">
            <span>Số điện thoại</span>
            <strong>{order.userInfo?.phone}</strong>
          </div>
          <div className="summary-row">
            <span>Loại đơn</span>
            <strong>{order.orderType === "delivery" ? "Giao hàng" : "Ăn tại bàn"}</strong>
          </div>
          {order.tableInfo?.tableNumber && (
            <div className="summary-row">
              <span>Bàn ăn</span>
              <strong>
                {order.tableInfo.tableNumber} - {order.tableInfo.area}
              </strong>
            </div>
          )}
          <div className="summary-row">
            <span>Tổng tiền</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>

        <div className="button-row">
          <Link to="/" className="secondary-button no-underline ">
            Về trang chủ
          </Link>
          <Link to="/cart/doneOrder" className="primary-button no-underline ">
            Xem lịch sử đơn
          </Link>
        </div>
      </article>
    </section>
  );
}

export default OrderSuccess;
