import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CardProducts from "../../mixi/cardProducts/cardProducts";

function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [highlightedRestaurants, setHighlightedRestaurants] = useState([]);

  useEffect(() => {
    fetch("/api/products/featured")
      .then((res) => res.json())
      .then((res) => {
        setFeatured(res.data || []);
        setLatest(res.dataProductsNew || []);
        setHighlightedRestaurants(res.highlightedRestaurants || []);
      })
      .catch(() => {
        setFeatured([]);
        setLatest([]);
        setHighlightedRestaurants([]);
      });
  }, []);

  return (
    <section className="page-stack">
      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nhà hàng được đánh giá cao</p>
           
          </div>
        
        </div>
        <div className="restaurant-grid">
          {highlightedRestaurants.map((restaurant) => (
            <div key={restaurant._id} className="restaurant-card">
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p className="address">{restaurant.address}</p>
                <p className="phone">{Number(restaurant.ratingAverage || 0).toFixed(1)} sao • {restaurant.orderCount || 0} luot mua</p>
              </div>
              <Link to={`/restaurant/${restaurant._id}/products`} className="btn btn-secondary">
                Xem menu
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mon an duoc goi nhieu nhat</p>
            <h2>Lua chon noi bat</h2>
          </div>
          <p>Danh sach uu tien theo suc mua va chat luong nha hang.</p>
        </div>
        <CardProducts data={featured} />
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Moi cap nhat</p>
            <h2>Mon moi trong thuc don</h2>
          </div>
        </div>
        <CardProducts data={latest} />
      </section>
    </section>
  );
}

export default FeaturedProducts;
