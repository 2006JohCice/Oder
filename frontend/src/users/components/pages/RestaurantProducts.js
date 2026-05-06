import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "../../css/RestaurantProducts.css";
import CardProducts from "../mixi/cardProducts/cardProducts";

const RestaurantProducts = () => {
  const { restaurantId } = useParams();
  const { fetchCart } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
  if (!restaurant) return <div className="loading">Không tìm thấy nhà hàng.</div>;

  return (
    <div className="restaurant-products">
      {/* {restaurant && (
        <div className="restaurant-header">
          <h2>{restaurant.name}</h2>
          <p className="address">{restaurant.address}</p>
          <p className="phone">{restaurant.phone}</p>
        </div>
      )} */}

      <div className="topbar">
        <span>{restaurant.name}</span>
        <span className="address">ADDRESS: {restaurant.address}</span>
        <span className="phone">CSKH-TEL: {restaurant.phone}</span>
        {/* <Link to="/cart/checkout?mode=table" className="no-underline">Dat ban ngay</Link> */}
      </div>

      <header className="app-header">
        <div className="brand-group">
          <Link to="/" className="logo no-underline">{restaurant.name}</Link>
        </div>
        <div className="header-actions">
          <nav className="site-nav">
            <div className="nav-dropdown">
              <button type="button" className="nav-link nav-link-button">
                Danh mục
                <i className="bi bi-chevron-down" />
              </button>

              <ul className="nav-dropdown-menu">
                <li>
                  <Link to="/products" className="nav-dropdown-link no-underline" >
                    Xem thêm
                  </Link>
                </li>
                {/* {Array.isArray(data) && data.map((item) => <MenuItem key={item._id} item={item} />)} */}
              </ul>
            </div>

            <Link to="/" className="nav-link no-underline" >
              Trang chủ
            </Link>
            <Link to="/restaurants" className="nav-link no-underline" >
              Nhà hàng
            </Link>
            <Link to="/products" className="nav-link no-underline" >
              Món nổi bật
            </Link>
            <Link to="/cart/checkout?mode=table" className="nav-link no-underline" >
              Đặt bàn
            </Link>
            <Link to="/cart/doneOrder" className="nav-link no-underline" >
              Đơn đặt
            </Link>

          </nav>
        </div>

        <div className="header-actions">
          <div className="user-chip" >
            <i className="bi bi-person-circle" />

            <div className="user-menu-wrap">
              <button type="button" className="user-menu-toggle" onClick={() => setUserMenuOpen((prev) => !prev)}>
                Reviewer
                <i className="bi bi-chevron-down" />
              </button>
              {userMenuOpen && (
                <ul className="user-dropdown-menu">

                  <li>
                    <Link to="/user/reports" className="user-dropdown-link no-underline" onClick={() => setUserMenuOpen(false)}>
                      Báo Cáo Nhà Hàng
                    </Link>
                  </li>
                  <li>
                    <Link to="/user/feedback" className="user-dropdown-link no-underline" title="Góp ý cho nhà hàng">
                      Góp ý Cho Nhà Hàng
                    </Link>
                  </li>
                </ul>
              )}

            </div>

          </div>

          {/* <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Mo menu"
          >
            <i className="bi bi-list" />
          </button> */}
        </div>



      </header>


      {/* <div className="products-grid">
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
      </div> */}
        <CardProducts data={products} />

     
      {products.length === 0 && (
        <div className="no-products">
          <p>Nhà hàng chưa có sản phẩm nào.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantProducts;
