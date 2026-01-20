import "../../css/detailProducts/detailProduct.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FeaturedProducts from "../MainContents/featuredProducts";

function ProductDetail() {
    const { slugProduct } = useParams();
    console.log(slugProduct)
    const [detailProduct, setDetailProduct] = useState(null);
    const [minStock ,setMinStock] = useState(1);
    const handleChangeStock = (e) =>{
         const value = e.target.value
         setMinStock(value)

    }
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

    return (
        <>
            <div className="detail-container">
                <div className="detail-image">
                    <img src={detailProduct.img} alt={detailProduct.name} />
                </div>

                <div className="detail-content">
                    <h1 className="detail-title">{detailProduct.name}</h1>
                    <p className="detail-price">
                        {detailProduct.price.toLocaleString()}đ
                    </p>
                    <p className="detail-desc">{detailProduct.description}</p>
                    <p className="detail-desc">
                        <input type="number" value={minStock} min="1"
                         onChange={(e) => handleChangeStock(e)}
                        >
                    
                    </input></p>


                    <div className="detail-actions">
                        <button className="detail-btn order">Đặt món</button>
                        <button className="detail-btn book">Đặt bàn</button>
                    </div>
                </div>
            </div>

            <FeaturedProducts />
        </>
    );
}

export default ProductDetail;
