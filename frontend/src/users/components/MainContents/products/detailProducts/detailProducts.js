import "../../../../css/detailProducts/detailProduct.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FeaturedProducts from "../../../MainContents/products/featuredProducts";
import Notification from "../../../../alerts/Notification";
import { useCart } from "../../../mixi/cart/CartContext";
function ProductDetail() {
    const navigate = useNavigate();
    const { slugProduct } = useParams();
    const [detailProduct, setDetailProduct] = useState(null);
    const [minStock, setMinStock] = useState(1);
    const [notifi, setNotifi] = useState("")
    const [recommendations, setRecommendations] = useState([]);

    const handleChangeStock = (e) => {
        const value = e.target.value
        setMinStock(value)

    }
    const { fetchCart } = useCart();




    const handlAddProductsCart = async () => {
        try {
            const res = await fetch("/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productId: detailProduct._id,
                    quantity: minStock
                })
            });

            if (res.status === 401) {
                navigate('/user/auth/login');
                return;
            }

            const data = await res.json();

            if (res.ok) {
                setNotifi(data.message);
                fetchCart();
            }
        
            // const data = await res.json();
            // console.log("ADD CART OK:", data);
        } catch (err) {
            alert("Đã xảy ra lỗi khi thêm sản phẩm");
        }
    };

    // ...existing code...
    const suggestedProducts = async (productName) => {
        if (!productName) return;
        const res = await fetch(`/api/recommend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                selectedFood: productName
            })

        });
        const data = await res.json();
        if (res.ok) {
            // console.log("SUGGESTION OK:", data);
            setRecommendations(data.dataSuggestion);
        }
    }
    // ...existing code...
    useEffect(() => {
        if (!slugProduct) return;
        fetch(`/api/products/detail/${slugProduct}`)
            .then(res => res.json())
            .then(data => {
                setDetailProduct(data);
                suggestedProducts(data?.name);
            })
            .catch(err => console.error("FETCH ERROR:", err));
    }, [slugProduct]);
    // ...existing code...

    if (!detailProduct) {

        return (
            <>
                <p>Sản Phẩm Đã Hết Hàng...</p>
                <FeaturedProducts />
            </>
        )
    }


    const handleClick = (click) => {

        if (click == "minus") {
            if (minStock > 1) {
                setMinStock(minStock - 1);
            }

        }
        if (click == "plus") {
            setMinStock(minStock + 1);
        }

        console.log("Min: ", minStock)
    }
    return (
        <>
            {notifi && (
                <Notification
                    message={notifi}
                    onClose={() => setNotifi("")}
                />
            )}
            <div className="detail-container">
                <div className="detail-container-order">
                    <div className="detail-image">
                        <img src={detailProduct.img} alt={detailProduct.name} />
                    </div>

                    <div className="detail-content">
                        <h1 className="detail-title">{detailProduct.name}</h1>
                        <p className="detail-price">
                            {detailProduct.price.toLocaleString()}đ
                        </p>
                        <p className="detail-desc">Stock: {detailProduct.stock}</p>
                        <p className="detail-desc">Style: {detailProduct.category}</p>
                        <p>{detailProduct.deleted ? "Không Còn Bán" : "Đang Bán "}</p>
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                <li className="page-item" onClick={() => handleClick("minus")}>
                                    <a className="page-link" href="#" aria-label="Previous">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                                <li className="page-item"><a className="page-link" href="#">{minStock}</a></li>

                                <li className="page-item" onClick={() => handleClick("plus")}>
                                    <a className="page-link" href="#" aria-label="Next">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                        <div>
                            <p>
                                {detailProduct.description}
                            </p>
                        </div>

                        <div className="detail-actions">
                            <button onClick={handlAddProductsCart} className="detail-btn order">Thêm Vào Giỏ Hàng</button>
                            <button className="detail-btn book">Đặt bàn</button>
                        </div>
                    </div>
                </div>
                <div className="detail-container-recommendations">
                    <div style={{ padding: '16px 10px', background: 'linear-gradient(135deg, #fff8e7, #fffdf8)', borderRadius: '18px', boxShadow: '0 4px 10px rgba(255, 193, 7, 0.15)' }}>
                        <h2 style={{ fontSize: "20px", textAlign: "center" }}>Sản Phẩm Gợi Ý</h2>
                    </div>
                    <div className="detail-image-right">
                        <div class="product-card" bis_skin_checked="1">
                            <div class="product-image" bis_skin_checked="1">
                                <img alt="Bánh xèo miền Trung" src="https://i.pinimg.com/1200x/eb/3c/79/eb3c790f030935a67058e81b4b876381.jpg" />
                                    <span class="inner-featured">Nổi Bật</span>
                            </div>
                            <div class="product-info" bis_skin_checked="1">
                                <a class="product-name" href="/products/detail/undefined" data-discover="true">Bánh xèo miền Trung</a>
                                <p class="product-price">40.000 đ</p>
                                <div class="product-actions" bis_skin_checked="1">
                                    <button class="product-btn product-btn-cart">Thêm</button></div></div>
                        </div>
                         <div class="product-card" bis_skin_checked="1">
                            <div class="product-image" bis_skin_checked="1">
                                <img alt="Bánh xèo miền Trung" src="https://i.pinimg.com/1200x/eb/3c/79/eb3c790f030935a67058e81b4b876381.jpg" />
                                    <span class="inner-featured">Nổi Bật</span>
                            </div>
                            <div class="product-info" bis_skin_checked="1">
                                <a class="product-name" href="/products/detail/undefined" data-discover="true">Bánh xèo miền Trung</a>
                                <p class="product-price">40.000 đ</p>
                                <div class="product-actions" bis_skin_checked="1">
                                    <button class="product-btn product-btn-cart">Thêm</button></div></div>
                        </div>
                          <div class="product-card" bis_skin_checked="1">
                            <div class="product-image" bis_skin_checked="1">
                                <img alt="Bánh xèo miền Trung" src="https://i.pinimg.com/1200x/eb/3c/79/eb3c790f030935a67058e81b4b876381.jpg" />
                                    <span class="inner-featured">Nổi Bật</span>
                            </div>
                            <div class="product-info" bis_skin_checked="1">
                                <a class="product-name" href="/products/detail/undefined" data-discover="true">Bánh xèo miền Trung</a>
                                <p class="product-price">40.000 đ</p>
                                <div class="product-actions" bis_skin_checked="1">
                                    <button class="product-btn product-btn-cart">Thêm</button></div></div>
                        </div>


                    </div>
                </div>

            </div>



            <FeaturedProducts />
        </>
    );
}

export default ProductDetail;
