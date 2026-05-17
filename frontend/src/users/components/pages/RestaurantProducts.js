import "../../css/RestaurantChildrenProducts.css";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import CardProducts from "../mixi/cardProducts/cardProducts";

import "../../css/RestaurantChildrenProducts.css";

const RestaurantProducts = () => {
  const { restaurantId } = useParams();
  const { fetchCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchRestaurantData = useCallback(async () => {
    setLoading(true);

    try {
      // Restaurant
      const restaurantRes = await fetch("/api/restaurants");
      const restaurantData = await restaurantRes.json();

      if (restaurantRes.ok) {
        const foundRestaurant = (
          restaurantData.restaurants || []
        ).find((item) => item._id === restaurantId);

        setRestaurant(foundRestaurant || null);
      }

      // Products
      const productsRes = await fetch(
        `/api/restaurants/${restaurantId}/products`
      );

      const productsData = await productsRes.json();

      if (productsRes.ok) {
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error("Load restaurant failed", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  if (loading) {
    return (
      <div className="restaurant-children-loading">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-children-loading">
        Không tìm thấy nhà hàng
      </div>
    );
  }

  return (
    <div className="restaurant-children-wrapper">
      <div className="restaurant-children-container">

        {/* HEADER */}
        <header className="restaurant-children-header">
          {/* MENU */}
          <nav className="restaurant-children-nav">
            <Link
              to="/"
              className="restaurant-children-nav-link"
            >
              Trang Chủ
            </Link>

            <Link
              to="/products"
              className="restaurant-children-nav-link"
            >
              Món Nổi Bật
            </Link>

            <Link
              to="/cart/checkout?mode=table"
              className="restaurant-children-nav-link"
            >
              Đồ Uống
            </Link>

            <Link
              to="/cart/doneOrder"
              className="restaurant-children-nav-link"
            >
              Đơn Đã Đặt
            </Link>
          </nav>

          {/* USER */}
          <div className="restaurant-children-user">
            <button
              className="restaurant-children-user-btn"
              onClick={() =>
                setUserMenuOpen(!userMenuOpen)
              }
            >
              <i className="bi bi-person-circle"></i>

              Reviewer

              <i className="bi bi-chevron-down"></i>
            </button>

            {userMenuOpen && (
              <div className="restaurant-children-user-menu">
                <Link
                  to="/user/reports"
                  className="restaurant-children-user-link"
                  onClick={() =>
                    setUserMenuOpen(false)
                  }
                >
                  Báo Cáo Nhà Hàng
                </Link>

                <Link
                  to="/user/feedback"
                  className="restaurant-children-user-link"
                  onClick={() =>
                    setUserMenuOpen(false)
                  }
                >
                  Góp Ý Nhà Hàng
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* HERO */}
        <section className="restaurant-children-banner">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
            alt=""
          />

          <div className="restaurant-children-overlay"></div>

          <div className="restaurant-children-banner-content">
            <h1>{restaurant.name}</h1>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="restaurant-children-products-section">
          <div className="restaurant-children-title-wrap">
            <div>
              <h2 className="restaurant-children-title">
                Danh Sách Món Ăn
              </h2>

              <p className="restaurant-children-desc">
                Các món ăn nổi bật của nhà hàng
              </p>
            </div>

            <span>
              {products.length} món ăn hiện có
            </span>
          </div>

          {products.length > 0 ? (
            <CardProducts
              data={products}
              fetchCart={fetchCart}
            />
          ) : (
            <div className="restaurant-children-empty">
              <i className="bi bi-basket"></i>

              <p>
                Nhà hàng chưa có sản phẩm nào
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RestaurantProducts;