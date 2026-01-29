import "../css/card/cartPay.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const apiCartProducts = () =>{

    fetch("/api/cart")
      .then(res => res.json())
      .then(res => setCartItems(res))
  
  }
    useEffect(()=>{
      apiCartProducts()
    },[])

  console.log("cartItems", cartItems)

  // Xóa sản phẩm
  const handleRemove = async (id) => {
    let url = `/api/cart/delete/${id}`
    const res = await fetch(url, {
      method: "DELETE",
    })
    if (res.ok) {
      alert("Xóa Thành Công")
      apiCartProducts()
    }
  };

  // Tổng số lượng
  const totalQuantity =
    cartItems?.products?.reduce((sum, item) => sum + item.quantity, 0)
  // Tổng tiền
  const totalPrice = 0
  // cartItems.reduce(
  //     (sum, item) => sum + item.price * item.quantity,
  //     0
  //   );

  return (
    <div className="cart-container">
      <h2>🛒 Giỏ hàng của bạn</h2>

      <table className="cart-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tổng tiền</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {cartItems?.products?.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>
                <img src={item.productInfo.img} alt={item.productInfo.name} />
              </td>
              <td className="product-name">
                <Link to={`/products/detail/${item.productInfo.slug}`}>
                  {item.productInfo.name}
                </Link>
              </td>
              <td>{item.productInfo.price}$</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  readOnly
                />
              </td>
              <td>{item.productInfo.price * item.quantity}$</td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => handleRemove(item.product_id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BẢNG TỔNG */}
      <div className="cart-summary">
        <div className="summary-row">
          <span>Tổng số lượng:</span>
          <strong>{totalQuantity}</strong>
        </div>
        <div className="summary-row">
          <span>Tổng tiền:</span>
          <strong>{cartItems?.totalCartPrice}
            $</strong>
        </div>
        <button className="btn-checkout">
          Thanh toán
        </button>
      </div>
    </div>
  );
}
