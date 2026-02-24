import { useState, useEffect } from "react";

function Order() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/checkout/doneOrder");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

const statusOptions =[
    { id: 1, value: "pending" },
    { id: 2, value: "activating" },
    { id: 3, value: "completed" },
 
]

  return (
    <>
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
                <td>{order.userInfo?.tableNumber || "N/A"}</td>
                <td>
                  <select
                    name="status"
                    className="admin-select"
                    style={{ width: "130px" }}
                    // value={newStatus}
                    // onChange={(e) => setNewStatus(e.target.value)}
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
