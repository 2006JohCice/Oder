import "../../css/detailProducts/detailProduct.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FeaturedProducts from "../MainContents/featuredProducts";
import Notification from "../../alerts/Notification";

function ProductDetail() {
    const { slugProduct } = useParams();
    const [detailProduct, setDetailProduct] = useState(null);
    const [minStock, setMinStock] = useState(1);
    const [notifi, setNotifi] = useState("")

    const handleChangeStock = (e) => {
        const value = e.target.value
        setMinStock(value)

    }
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

            const data = await res.json();

            if (res.ok) {
                setNotifi(data.message);
            }
            // const data = await res.json();
            // console.log("ADD CART OK:", data);
        } catch (err) {
            alert("Đã xảy ra lỗi khi thêm sản phẩm");
        }
    };


    console.log(detailProduct)



    useEffect(() => {
        if (!slugProduct) return;

        fetch(`/api/products/detail/${slugProduct}`)
            .then(res => res.json())
            .then(data => setDetailProduct(data))
            .catch(err => console.error("FETCH ERROR:", err));
    }, [slugProduct]);

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
                    {/* <p className="detail-desc">
                        <input type="number" value={minStock} min="1"
                            onChange={(e) => handleChangeStock(e)}
                            style={{ width: "50px" }}
                        >

                        </input></p> */}
                    {/* <div className="item-quantity" style={{ width: "100px" }}>
                        <button className="btn-quantity">-</button>
                        <input type="number" value={minStock} min="1"
                        style={{ width: "50px" }}
                        >
                        </input>
                        <button  className="btn-quantity">+</button>
                    </div> */}

                    <nav aria-label="Page navigation example">
                        <ul className="pagination">
                            <li className="page-item"  onClick={() => handleClick("minus")}>
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

            <FeaturedProducts />
        </>
    );
}

export default ProductDetail;
