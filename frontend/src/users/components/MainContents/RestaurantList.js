import { useEffect, useState } from "react";
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
      const res = await fetch("/api/user/me", { credentials: "include" });
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
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Dang tai danh sach nha hang...</div>;
  }

  return (
    <div className="restaurant-list">
      <div className="restaurant-header">
        <h2>Danh sach nha hang</h2>
        {user && (
          <Link to="/restaurant/register" className="no-underline">
            Dang ky nha hang
          </Link>
        )}
      </div>

      {!user && (
        <div className="login-prompt">
          <p>Vui long <Link to="/user/auth/login">dang nhap</Link> de xem danh sach nha hang va dang ky nha hang moi.</p>
        </div>
      )}

      {user && (
        <>
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="restaurant-card">
                <div className="restaurant-info">
                  <h3>{restaurant.name}</h3>
                  <p className="address">{restaurant.address}</p>
                  <p className="phone">{restaurant.phone}</p>
                  <p className="owner">Chu so huu: {restaurant.owner_id?.fullname || "N/A"}</p>
                  <p className="phone">
                    {Number(restaurant.ratingAverage || 0).toFixed(1)} sao • {restaurant.orderCount || 0} luot mua
                  </p>
                </div>
                <Link
                  to={`/restaurant/${restaurant._id}/products`}
                  className="btn btn-secondary"
                >
                  Xem menu
                </Link>
              </div>
            ))}
          </div>

          {restaurants.length === 0 && (
            <div className="no-restaurants">
              <p>Chua co nha hang nao hoat dong.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantList;
