import { Link } from "react-router-dom";
import "../css/card/cartPay.css";
import { useState,useEffect } from "react";

import cartControl from "../control/cart.control";



function Cart() {
    const {cart,handleClick,formatCurrency,shippingFee,sum} = cartControl();
    
    
    
    return (
        <div className="card-content main-content col-xl-10">
             <div className="cart-items" >
          
                    {cart.map(item => (
                        <div className="cart-item" key={item.id}>
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div className="item-details">
                            <h3>{item.name}</h3>
                            <p className="item-price">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="item-quantity">
                            <button onClick={() => handleClick("minus", item.id)} className="btn-quantity">-</button>
                            <input type="number" value={item.quantity} readOnly />
                            <button onClick={() => handleClick("plus", item.id)} className="btn-quantity">+</button>
                        </div>
                        <p className="item-total">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                    ))}
             </div>
    


            <div className="cart-summary">
                <h2>Tóm tắt đơn hàng</h2>
                <div className="summary-row">
                    <span>Tạm tính</span>
                    {/* <span>{formatCurrency(subtotal)}</span> */}
                    <span>{formatCurrency(sum)}</span>
                </div>
                <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div className="coupon-code">
                    <input type="text" placeholder="Nhập mã giảm giá" />
                    
                </div>
                <div className="summary-row total-row">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(sum)}</span>
                </div>
                <Link 
                    to={"/cart/pay"} style={{ color: 'white', textDecoration: 'none' }}
                    state={{ cart: cart, total: sum }}
                    >
                <button className="checkout-btn" >
                  
                    Tiến Hành Thanh Toán
                   
                </button>
                 </Link>
            </div>

         <div className="hot-food-box">

    <div className="hot-grid" style={{display:"flex"}}>

        <div className="hot-item">
            <img src="https://picsum.photos/seed/food1/300/200" alt="food" />
            <div className="hot-info">
                <h3>Phở Bò Đặc Biệt</h3>
                <p>Giá: 45.000đ</p>
            </div>
             <div className="item-quantity">
                            <button  className="btn-quantity">-</button>
                            <input type="number" readOnly />
                            <button  className="btn-quantity">+</button>
            </div>
        </div>

        <div className="hot-item">
            <img src="https://picsum.photos/seed/food2/300/200" alt="food" />
            <div className="hot-info">
                <h3>Bánh Mì Thịt Nướng</h3>
                <p>Giá: 25.000đ</p>
            </div>
        </div>

        <div className="hot-item">
            <img src="https://picsum.photos/seed/food3/300/200" alt="food" />
            <div className="hot-info">
                <h3>Cơm Gà Hải Nam</h3>
                <p>Giá: 55.000đ</p>
            </div>
        </div>

        <div className="hot-item">
            <img src="https://picsum.photos/seed/food4/300/200" alt="food" />
            <div className="hot-info">
                <h3>Bún Chả Hà Nội</h3>
                <p>Giá: 40.000đ</p>
            </div>
        </div>

    </div>
</div>

        </div>
    );
}

export default Cart;