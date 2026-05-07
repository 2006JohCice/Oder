import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../css/RestaurantProducts.css";
import CardProducts from "../mixi/cardProducts/cardProducts";

const RestaurantProducts = () => {
  const { restaurantId } = useParams();
  const [products, setProducts] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant info
      const restaurantRes = await fetch(`/api/restaurants`);
      const restaurantData = await restaurantRes.json();
      if (restaurantRes.ok) {
        const foundRestaurant = restaurantData.restaurants.find(
          (r) => r._id === restaurantId
        );
        setRestaurant(foundRestaurant);
      }

      // Fetch products
      const productsRes = await fetch(`/api/restaurants/${restaurantId}/products`);
      const productsData = await productsRes.json();
      if (productsRes.ok) {
        setProducts(productsData.products);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="restaurant-products">
      {restaurant && (
        <div className="restaurant-header">
          <h2>{restaurant.name}</h2>
          <p className="address"> {restaurant.address}</p>
          <p className="phone"> {restaurant.phone}</p>
        </div>
      )}

      {/* <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img
              src={product.img || "/default-food.jpg"}
              alt={product.name}
              className="product-image"
            />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">{product.price?.toLocaleString()} VND</p>
              <p className="description">{product.description}</p>
            </div>
            <button className="btn btn-primary">Thêm vào giỏ</button>
          </div>
        ))}
      </div> */}

      <CardProducts data={products} restaurantId={restaurantId} />

      {products.length === 0 && (
        <div className="no-products">
          <p>Nhà hàng chưa có sản phẩm nào.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantProducts;