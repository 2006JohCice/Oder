import "../css/card/cartPay.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CardProducts from "../components/mixi/cardProducts/cardProducts";


export default function CheckoutCart() {
    const [cartItems, setCartItems] = useState([]);
    const [dataFeatured, setDataFeatured] = useState([]);
    const [loadCard, setLoadCart] = useState(false);
    useEffect(() => {
        let url = '/api/products/featured'
        fetch(url)
            .then(res => res.json())
            .then(res => {
                setDataFeatured(res.data)

            })
            .catch(() => setLoadCart(true));


    }, [])
    const apiCartProducts = () => {

        fetch("/api/cart")
            .then(res => res.json())
            .then(res => setCartItems(res))

    }
    useEffect(() => {
        apiCartProducts()
    }, [])

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


    return (
        <div className="cart-container">
            <h2> Giỏ hàng của bạn</h2>

            <table className="cart-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Ảnh</th>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng tiền</th>
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
                                {item.productInfo.name}
                            </td>
                            <td>{item.productInfo.price}$</td>
                            <td>
                                {item.quantity}
                            </td>
                            <td>{item.productInfo.price * item.quantity}$</td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {/* BẢNG TỔNG */}
            <div>
                <div className="cart-donePay">
                    <div className="cart-summary">


                        <div class="mb-3">
                            <label for="formGroupExampleInput" class="form-label">Họ và Tên</label>
                            <input type="text" class="form-control" id="formGroupExampleInput" placeholder="Họ và tên" />
                        </div>
                        <div class="mb-3">
                            <label for="formGroupExampleInput2" class="form-label">Số Điện Thoại</label>
                            <input type="text" class="form-control" id="formGroupExampleInput2" placeholder="Số điện thoại" />
                        </div>
                        <div class="mb-3">
                            <label for="formGroupExampleInput2" class="form-label">Địa chỉ</label>
                            <input type="text" class="form-control" id="formGroupExampleInput2" placeholder="Địa chỉ" />
                        </div>
                    </div> <div className="cart-summary">
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
                <div>
                    <CardProducts data={dataFeatured} />
                </div>

            </div>


        </div>
    );
}
