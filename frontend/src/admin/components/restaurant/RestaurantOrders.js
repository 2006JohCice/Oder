import { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "../../../users/utils/shop";
import "../../css/RestaurantOrders.css";

const statusOptions = ["pending", "activating", "completed", "cancelled"];

const RestaurantOrders = ({ restaurant }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [restaurant]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/orders", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    const res = await fetch(`/api/restaurant/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadOrders();
    }
  };

  if (loading) {
    return <div className="loading">Dang tai don hang...</div>;
  }

  return (
    <div className="restaurant-orders">
      <div className="page-header">
        <h2>Quan ly don hang - {restaurant?.name}</h2>
      </div>

      <div className="orders-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>Chua co don hang nao</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ma don</th>
                <th>Khach hang</th>
                <th>Loai don</th>
                <th>Thong tin</th>
                <th>Tong tien</th>
                <th>Coc</th>
                <th>Ngay tao</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>{order.orderId}</strong>
                    <div className="admin-muted">{order.orderGroupCode || "Don le"}</div>
                  </td>
                  <td>
                    <strong>{order.userInfo?.fullName || "Khach"}</strong>
                    <div>{order.userInfo?.phone || "--"}</div>
                  </td>
                  <td>{order.orderType === "delivery" ? "Giao hang" : "Dat ban"}</td>
                  <td>
                    {order.orderType === "delivery" ? (
                      <span>{order.userInfo?.address || "--"}</span>
                    ) : (
                      <>
                        <div>{order.tableInfo?.tableNumber || "--"} - {order.tableInfo?.area || "--"}</div>
                        <div className="admin-muted">{order.tableInfo?.visitDate || "--"} {order.tableInfo?.arrivalTime || ""}</div>
                        {order.relativeContact?.phone && (
                          <div className="admin-muted">Nguoi than: {order.relativeContact.fullName} - {order.relativeContact.phone}</div>
                        )}
                      </>
                    )}
                  </td>
                  <td>{formatCurrency(order.totalAmount || 0)}</td>
                  <td>{formatCurrency(order.depositAmount || 0)}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <select value={order.orderStatus} onChange={(e) => updateStatus(order._id, e.target.value)}>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;
