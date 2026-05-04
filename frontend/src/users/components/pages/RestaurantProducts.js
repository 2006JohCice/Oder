import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import "../../css/RestaurantProducts.css";

const RestaurantProducts = () => {
  const { restaurantId } = useParams();
  const { fetchCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState("");

  const fetchRestaurantData = useCallback(async () => {
    setLoading(true);
    try {
      const restaurantRes = await fetch("/api/restaurants");
      const restaurantData = await restaurantRes.json();
      if (restaurantRes.ok) {
        const found = (restaurantData.restaurants || []).find((r) => r._id === restaurantId);
        setRestaurant(found || null);
      }

      const productsRes = await fetch(`/api/restaurants/${restaurantId}/products`);
      const productsData = await productsRes.json();
      if (productsRes.ok) {
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error("Load restaurant products failed", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const handleAddToCart = async (productId) => {
    if (addingId) return;
    setAddingId(productId);
    try {
      const res = await fetch(`/api/cart/add/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Không thể thêm vào giỏ hàng");
      } else {
        await fetchCart();
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setAddingId("");
    }
  };

  if (loading) return <div className="loading">Đang tải sản phẩm...</div>;

  return (
    <div className="restaurant-products">
      {restaurant && (
        <div className="restaurant-header">
          <h2>{restaurant.name}</h2>
          <p className="address">{restaurant.address}</p>
          <p className="phone">{restaurant.phone}</p>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.img || "/default-food.jpg"} alt={product.name} className="product-image" loading="lazy" />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">{Number(product.price || 0).toLocaleString("vi-VN")} đ</p>
              <p className="description">{product.description || "Không có mô tả"}</p>
            </div>
            <button className="btn btn-primary" disabled={addingId === product._id} onClick={() => handleAddToCart(product._id)}>
              {addingId === product._id ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>Nhà hàng chưa có sản phẩm nào.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantProducts;
