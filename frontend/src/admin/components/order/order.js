import { useState, useEffect } from "react";
import AutoCloseNotification from "../alerts/AutoCloseNotification";

function Order() {
  const [orders, setOrders] = useState([]);
  const [idOrders, setIdOrder] = useState([]);
  const [table, setTable] = useState(false);
  const [messege , setMessege] = useState("")
const handleChangeStatus = (orderId, status, orderCode) => {
  setIdOrder((prev) => {
    const existingIndex = prev.findIndex((item) => item[0] === orderId);
    if (existingIndex !== -1) {
      const updated = [...prev];
      updated[existingIndex] = [orderId, status, orderCode];
      return updated;
    } else {
      return [...prev, [orderId, status, orderCode]];
    }
  });

  // Cập nhật trạng thái orderStatus trong orders để giao diện phản ứng ngay
  setOrders((prevOrders) =>
    prevOrders.map((order) =>
      order._id === orderId ? { ...order, orderStatus: status } : order
    )
  );
};
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/checkout/doneOrder");
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const statusOptions = [
    { id: 1, value: "pending" },
    { id: 2, value: "activating" },
    { id: 3, value: "completed" },
  ];
  const handleClick = async () => {
    let url = "/api/admin/authenOrder";
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNew: idOrders }),
    });
    const res = await response.json();

        setMessege(res.message);
        setTimeout(() => {
          setMessege("");
        }, 3000);
  };

  return (
    <>
      {messege && <AutoCloseNotification message={messege} />}
      <div style={{ display: "flex", gap: "10px" }}>
        <select
          name="status"
          className="admin-select"
          style={{ width: "130px" }}
        ></select>
        <button className="btn-accent" onClick={handleClick}>
          Áp Dụng
        </button>
      </div>
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Trạng Thái</th>
              <th>Mã Đơn Hàng</th>
              <th>Số Tiền</th>
              <th>Vị Trí</th>
              <th>Ngày Tạo</th>
              <th>Số Bàn</th>
              <th>Hành Động</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>
                  {order.status === "pending" ? (
                    <span style={{ color: "orange" }}>Đang Xử Lý</span>
                  ) : (
                    <span style={{ color: "green" }}>Đã Xử Lý</span>
                  )}
                </td>
                <td>{order.orderId}</td>
                <td>
                  {Array.isArray(order.products)
                    ? order.products.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                    : 0}
                  $
                </td>
                <td>{order.userInfo?.address || "N/A"}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: "center" }}>
                  <input
                    style={{ width: "50px", textAlign: "center" }}
                    type="text"
                    value={order.tableNumber || "N/A"}
                    onClick={() => setTable(true)}
                  />
                </td>
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
                        {opt.value}
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
