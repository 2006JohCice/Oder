/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import { useState, useEffect } from "react";
import AutoCloseNotification from "../alerts/AutoCloseNotification";
import { formatCurrency, formatDateTime } from "../../../users/utils/shop";

function Order() {
  const [orders, setOrders] = useState([]);
  const [idOrders, setIdOrder] = useState([]);
  const [messege, setMessege] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/checkout/doneOrder");
      const data = await response.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleChangeStatus = (orderId, status, orderCode) => {
    setIdOrder((prev) => {
      const existingIndex = prev.findIndex((item) => item[0] === orderId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = [orderId, status, orderCode];
        return updated;
      }
      return [...prev, [orderId, status, orderCode]];
    });

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, orderStatus: status } : order
      )
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusOptions = [
    { id: 1, value: "pending", label: "pending" },
    { id: 2, value: "activating", label: "activating" },
    { id: 3, value: "completed", label: "completed" },
  ];

  const handleClick = async () => {
    const response = await fetch("/api/admin/authenOrder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNew: idOrders }),
    });
    const res = await response.json();

    setMessege(res.message);
    setIdOrder([]);
    fetchOrders();
    setTimeout(() => {
      setMessege("");
    }, 3000);
  };

  return (
    <>
      {messege && <AutoCloseNotification message={messege} />}
      <div style={{ display: "flex", gap: "10px", marginBottom: 16 }}>
        <button className="btn-accent" onClick={handleClick} disabled={idOrders.length === 0}>
          Ap dung cap nhat
        </button>
      </div>
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Trang thai</th>
              <th>Ma don hang</th>
              <th>Khach hang</th>
              <th>Tong tien</th>
              <th>Loai don</th>
              <th>Ban</th>
              <th>Ngay tao</th>
              <th>Hanh dong</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>
                  <span
                    style={{
                      color:
                        order.orderStatus === "completed"
                          ? "green"
                          : order.orderStatus === "activating"
                          ? "#0c63e7"
                          : "orange",
                      fontWeight: 600,
                    }}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td>{order.orderId}</td>
                <td>
                  <strong>{order.userInfo?.fullName || "N/A"}</strong>
                  <div>{order.userInfo?.phone || "N/A"}</div>
                </td>
                <td>{formatCurrency(
                  Array.isArray(order.products)
                    ? order.products.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                    : 0
                )}</td>
                <td>{order.orderType === "delivery" ? "Giao hang" : "Tai ban"}</td>
                <td>
                  {order.orderType === "dine_in"
                    ? `${order.tableInfo?.tableNumber || "N/A"} ${order.tableInfo?.area ? `- ${order.tableInfo.area}` : ""}`
                    : "Khong ap dung"}
                </td>
                <td>{formatDateTime(order.createdAt)}</td>
                <td>
                  <select
                    name="status"
                    className="admin-select"
                    style={{ width: "130px" }}
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleChangeStatus(
                        order._id,
                        e.target.value,
                        order.orderId
                      )
                    }
                  >
                    {statusOptions?.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Order;
