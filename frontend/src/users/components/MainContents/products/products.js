import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CardProducts from "../../mixi/cardProducts/cardProducts";
import RecommendedRestaurants from "./RecommendedRestaurants";
import "../../../css/ForYou.css";

function Products() {
    const [productsData, setProductsData] = useState([]);
    const [restaurantsData, setRestaurantsData] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);

    useEffect(() => {
        // Fetch products
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setProductsData(data);
                    // Mock new arrivals by reversing array
                    setNewArrivals([...data].reverse().slice(0, 4));
                }
            })
            .catch(() => setProductsData([]));

        // Fetch restaurants
        fetch("/api/restaurants")
            .then((res) => res.json())
            .then((res) => {
                if (res.success && Array.isArray(res.data)) {
                    setRestaurantsData(res.data);
                }
            })
            .catch(() => setRestaurantsData([]));
    }, []);

    return (
        <section className="gp-foryou-section">
            <div className="gp-foryou-container">

                {/* Header */}
               
                    <div className="gp-foryou-header">
                        <div>
                            <span className="gp-foryou-badge">Khám phá</span>
                            <h3 className="gp-foryou-title">Dành Riêng Cho Bạn</h3>
                            <p className="gp-foryou-subtitle">Những gợi ý ẩm thực tuyệt vời nhất dựa trên sở thích của bạn.</p>
                        </div>
                    </div>
              

                {/* Recommended Restaurants Section */}
                <RecommendedRestaurants />

                {/* Restaurants Slider */}
                {restaurantsData.length > 0 && (
                    <div className="gp-foryou-block">
                        <div className="gp-foryou-block-head">
                            <h4><i className="bi bi-shop text-danger"></i> Nhà Hàng Nổi Bật</h4>
                            <Link to="/restaurants">Xem tất cả <i className="bi bi-arrow-right"></i></Link>
                        </div>

                        <div className="gp-foryou-slider gp-rest-slider">
                            {restaurantsData.slice(0, 5).map(rest => {
                                const hash = parseInt(rest._id?.slice(-4) || "0", 16);
                                const rating = Number(rest.ratingAverage || ((hash % 10) / 10 + 4)).toFixed(1);
                                const reviews = hash % 500 + 50;

                                return (
                                    <Link to={`/restaurants/${rest._id}`} className="gp-rest-card" key={rest._id}>
                                        <div className="gp-rest-cover">
                                            <img src={rest.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"} alt={rest.name} />
                                            <div className="gp-rest-rating">
                                                <i className="bi bi-star-fill text-warning"></i> {rating} ({reviews})
                                            </div>
                                            {rest.isOpen === false && (
                                                <div className="gp-rest-closed-overlay">Đóng cửa</div>
                                            )}
                                        </div>
                                        <div className="gp-rest-info">
                                            <h5>{rest.name}</h5>
                                            <p><i className="bi bi-geo-alt-fill"></i> {rest.address || "Hệ thống toàn quốc"}</p>
                                            <div className="gp-rest-tags">
                                                <span>Đặc sản</span>
                                                <span>Phổ biến</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* New Arrivals Slider (smaller grid) */}
                {newArrivals.length > 0 && (
                    <div className="gp-foryou-block" style={{ marginTop: '40px' }}>
                        <div className="gp-foryou-block-head">
                            <h4><i className="bi bi-stars text-warning"></i> Món Mới Khám Phá</h4>
                        </div>

                        <div className="gp-foryou-products-wrap">
                            <CardProducts data={newArrivals} />
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="gp-foryou-block" style={{ marginTop: '40px' }}>
                    <div className="gp-foryou-block-head">
                        <h4><i className="bi bi-fire text-danger"></i> Deal Hot Trưa Nay</h4>
                        <Link to="/products">Xem tất cả <i className="bi bi-arrow-right"></i></Link>
                    </div>

                    <div className="gp-foryou-products-wrap">
                        <CardProducts data={productsData.slice(0, 8)} />
                    </div>
                </div>

            </div>
        </section>
    );
}

export default Products;
