import { useState, useEffect } from "react";

function Order() {
  const [orders, setOrders] = useState([]);
  const [table, setTable] = useState(false);
  console.log(orders)
  const handleChangeStatus = (orderId, newStatus) => {
  setOrders((prev) =>
    prev.map((o) =>
      o._id === orderId ? { ...o, orderStatus: newStatus } : o
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
const handlClick = async () => {
 

  const res = await fetch("/api/checkout/authenOrder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ordersAuthen:orders
    }),
  });

  const data = await res.json();
};
  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>          <select
            name="status"
            className="admin-select"
            style={{ width: "130px" }}
           
          >
          </select>
    <button className="btn-accent" onClick={handlClick}>Áp Dụng</button>
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
                <td style={{ textAlign: "center"  }} >
                    <input style={{ width: "50px", textAlign: "center" }}
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
                    onChange={(e) => handleChangeStatus(order._id, e.target.value)}
                 
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
