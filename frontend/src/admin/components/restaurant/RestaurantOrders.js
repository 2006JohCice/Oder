import { useState, useEffect } from "react";
import "../../css/RestaurantOrders.css";

const RestaurantOrders = ({ restaurant }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [restaurant]);

  const loadOrders = async () => {
    try {
      // TODO: Implement orders API for restaurant
      setOrders([]);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="restaurant-orders">
      <div className="page-header">
        <h2>Quản lý Đơn hàng</h2>
      </div>

      <div className="orders-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.total?.toLocaleString()} VND</td>
                  <td>{order.status}</td>
                  <td>
                    <button className="btn btn-view">Xem chi tiết</button>
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