import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/RestaurantList.css";

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
        fetchRestaurants();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user/me");
            const data = await res.json();
            setUser(data?.user || null);
        } catch (error) {
            setUser(null);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const res = await fetch("/api/restaurants");
            const data = await res.json();
            if (res.ok) {
                setRestaurants(data.restaurants);
            }
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải danh sách nhà hàng...</div>;
    }

    return (
        <div className="restaurant-list">
            <div className="restaurant-header">
                <h2>Danh Sách Nhà Hàng</h2>
                {user && (
  
                  <Link to="/restaurant/register" className="no-underline">  Đăng Ký Nhà Hàng</Link>

                )}
            </div>

            {!user && (
                <div className="login-prompt">
                    <p>Vui lòng <Link to="/user/auth/login">đăng nhập</Link> để xem danh sách nhà hàng và đăng ký nhà hàng mới.</p>
                </div>
            )}

            {user && (
                <>
                    <div className="restaurant-grid">
                        {restaurants.map((restaurant) => (
                            <div key={restaurant._id} className="restaurant-card">
                                <div className="restaurant-info">
                                    <h3>{restaurant.name}</h3>
                                    <p className="address"> {restaurant.address}</p>
                                    <p className="phone"> {restaurant.phone}</p>
                                    <p className="owner">
                                        Chủ sở hữu: {restaurant.owner_id?.fullname || "N/A"}
                                    </p>
                                </div>
                                <Link
                                    to={`/restaurant/${restaurant._id}/products`}
                                    className="btn btn-secondary"
                                >
                                    Xem Menu
                                </Link>
                            </div>
                        ))}
                    </div>

                    {restaurants.length === 0 && (
                        <div className="no-restaurants">
                            <p>Chưa có nhà hàng nào hoạt động.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RestaurantList;