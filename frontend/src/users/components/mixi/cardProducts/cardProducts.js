import { Link } from "react-router-dom";




function CardProducts({ data }) {
    console.log(data)
    const widthWeb = window.innerWidth;
    const containerWidth = data.length <= 3 ? "50%" : "100%";
    
    return (
        <>
            <div className="card-products-container" style={{width:containerWidth} }>
                <div className="products-grid">
                    {Array.isArray(data) && data?.map(p => (
                        <div className="product-card" key={p._id}>

                            <div className="product-image">
                                <img src={p.img} alt={p.name} />
                                {p.featured == '1' && (
                                    <span className="inner-featured">
                                        Nổi Bật
                                    </span>
                                )}
                            </div>

                            <div className="product-info">

                                <Link to={`/products/detail/${p.slug}`}  className="product-name" >
                                        {p.name}
                                </Link>
                                <p className="product-price">{p.price.toLocaleString()} đ</p>

                                <div className="product-actions">
                                    <button
                                        className="product-btn product-btn-cart"
                                    // onClick={() => addToCart(p)}
                                    >
                                        Thêm
                                    </button>
                                    <button className="product-btn product-btn-buy">
                                        Mua ngay
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default CardProducts;