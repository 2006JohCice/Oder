import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime } from "../../utils/shop";

function DoneOrder() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetch("/api/checkout/doneOrder", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch(() => setGroups([]));
  }, []);

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lich su don hang</p>
          <h2>Theo doi nhom don, nha hang va thong tin dat ban</h2>
        </div>
      </div>

      <div className="history-grid">
        {groups.map((group) => (
          <article className="history-card" key={group.orderGroupCode || group.createdAt}>
            <div className="history-card-top">
              <span className="status-pill">{group.orders?.[0]?.orderStatus || "pending"}</span>
              <strong>{group.orderGroupCode || "Don le"}</strong>
            </div>
            <p>{formatDateTime(group.createdAt)}</p>
            <p>{group.orders?.length || 0} nha hang</p>
            {(group.orders || []).map((order) => (
              <div key={order._id} style={{ marginBottom: 10 }}>
                <strong>{order.restaurantInfo?.name || order.orderId}</strong>
                <p>{order.orderType === "delivery" ? "Giao hang" : "Dat ban"} - {formatCurrency(order.totalAmount || 0)}</p>
                {order.tableInfo?.tableNumber && (
                  <p>
                    Ban {order.tableInfo.tableNumber} - {order.tableInfo.area} - {order.tableInfo.guestCount} khach
                  </p>
                )}
              </div>
            ))}
            <strong>{formatCurrency(group.totalAmount || 0)}</strong>
            <Link to={`/cart/checkout/success/${group.orders?.[0]?._id}`} className="secondary-button full-width no-underline ">
              Xem chi tiet
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DoneOrder;
