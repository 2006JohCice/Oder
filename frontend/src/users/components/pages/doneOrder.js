import { useState,useEffect } from "react";

function DoneOrder() {
  const [orders, setOrders] = useState([]);
    const handleViewDetails = (orderId) => {
      // Chuyển hướng đến trang chi tiết đơn hàng
      if(orderId){
      window.location.href = `/cart/checkout/success/${orderId}`;
      }
    }

  useEffect(() => {
    fetch('/api/checkout/doneOrder')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
      })
      .catch(err => console.error('Lỗi khi lấy thông tin đơn hàng:', err));
  }, []);
  console.log("orders", orders);
  return (
    <div className="cart-container">
      <h2>Đơn Hàng Của Bạn</h2>

      <table className="cart-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Trạng Thái</th>
            <th>Mã Hóa Đơn</th>
            <th>Tổng tiền</th>
            <th>Chi Tiết</th>
          </tr>
        </thead>

        <tbody>
          {orders?.map((order,index) => (
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
              <td>{Array.isArray(order.products) ? order.products.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0}$</td>
              <td>
                <button
                className="btn-view-details"
                  onClick={() => handleViewDetails(order._id)}
                >
                  Chi Tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
export default DoneOrder;
