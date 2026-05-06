import { useEffect, useState } from "react";
import Header from "../components/Header";
import MainContent from "../components/HouseMain";
import { Routes, Route } from "react-router-dom";
import Cart from "../components/pages/cart";
import ProductsList from "../components/MainContents/products/productList";
import ProductCategoryPage from "../components/pages/ProductForCategory";
import ProductDetail from "../components/MainContents/products/detailProducts/detailProducts";
import SearchProduct from "../components/listSearchProducts/searchProducts";
import OrderSuccess from "../components/pages/success";
import CheckoutCart from "../components/pages/checkoutCart";
import DoneOrder from "../components/pages/doneOrder";
import RestaurantList from "../components/MainContents/RestaurantList";
import RestaurantRegister from "../components/pages/RestaurantRegister";
import RestaurantProducts from "../components/pages/RestaurantProducts";


import Loading from "../utils/Loading";

function DefaultLayout() {

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await fetch("/api/init-cart").catch(() => {});
      } catch (error) {
        console.error("Lỗi init:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000); 
      }
    };

    initApp();
  }, []);

  // loading screen
  if (loading) {
    return <Loading />;
  }

  return (
    <main className="site-shell">
      <Header />

      <div className="site-main">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/:slugCategory" element={<ProductCategoryPage />} />
          <Route path="/products/detail/:slugProduct" element={<ProductDetail />} />
          <Route path="/search" element={<SearchProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/cart/checkout" element={<CheckoutCart />} />
          <Route path="/cart/checkout/success/:orderId" element={<OrderSuccess />} />
          <Route path="/cart/doneOrder" element={<DoneOrder />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurant/register" element={<RestaurantRegister />} />
          <Route path="/restaurant/:restaurantId/products" element={<RestaurantProducts />} />
  
        </Routes>
      </div>

    </main>
  );
}

export default DefaultLayout;