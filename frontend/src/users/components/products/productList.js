import React, { useState } from "react";
import "../../css/products/products.css"
import CardLoading from "../mixi/CardLoading";


const products = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        price: "35.000.000đ",
        image: "https://picsum.photos/300/200?1",
    },
    {
        id: 2,
        name: "Laptop Gaming ASUS ROG",
        price: "28.500.000đ",
        image: "https://picsum.photos/300/200?2",
    },
    {
        id: 3,
        name: "Tai nghe Bluetooth Sony",
        price: "2.300.000đ",
        image: "https://picsum.photos/300/200?3",
    },
    {
        id: 4,
        name: "Chuột Gaming Logitech G Pro",
        price: "1.500.000đ",
        image: "https://picsum.photos/300/200?4",
    },
];

const widthWeb = window.innerWidth;


function ProductsList() {

    const [LoadingCart, setLoadingCart] = useState(true);

    return (
        <>

            {LoadingCart ? (
                <CardLoading widthWeb={widthWeb} />
            ) : (
                <div className="card-products-container">
                    <div className="products-grid">
                        {products.map((item) => (
                            <div className="product-card" key={item.id}>

                                <div className="product-image">
                                    <img src={item.image} alt={item.name} />
                                </div>

                                <div className="product-info">
                                    <h3 className="product-name">{item.name}</h3>
                                    <p className="product-price">{item.price}</p>

                                    <div className="product-actions">
                                        <button className="product-btn product-btn-buy">
                                            Mua ngay
                                        </button>
                                        <button className="product-btn product-btn-cart">
                                            Thêm vào giỏ
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

            }


        </>
    );
}

export default ProductsList;