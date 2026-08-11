import React, { useEffect, useState, Suspense, lazy } from "react";

import "../css/responsive.css";
import Header from "../components/Header";
import MainContent from "../components/HouseMain";
import { Routes, Route } from "react-router-dom";
import Footer from "../components/foot/Footer";
import TopProgressBar from "../components/TopProgressBar";

// Áp dụng Lazy Loading cho các component
const Cart = lazy(() => import("../components/pages/cart"));
const ProductsList = lazy(() => import("../components/MainContents/products/productList"));
const ProductCategoryPage = lazy(() => import("../components/pages/ProductForCategory"));
const ProductDetail = lazy(() => import("../components/MainContents/products/detailProducts/detailProducts"));
const SearchProduct = lazy(() => import("../components/listSearchProducts/searchProducts"));
const OrderSuccess = lazy(() => import("../components/pages/success"));
const CheckoutCart = lazy(() => import("../components/pages/checkoutCart"));
const DoneOrder = lazy(() => import("../components/pages/doneOrder"));
const RestaurantList = lazy(() => import("../components/MainContents/RestaurantList"));
const RestaurantRegister = lazy(() => import("../components/pages/RestaurantRegister"));
const RestaurantProducts = lazy(() => import("../components/pages/RestaurantProducts"));
const BookTable = lazy(() => import("../components/pages/BookTable"));
const RestaurantManagement = lazy(() => import("../components/pages/RestaurantManagement"));
const UserSettings = lazy(() => import("../components/pages/UserSettings"));
const UserVouchers = lazy(() => import("../components/pages/UserVouchers"));
const LegalPage = lazy(() => import("../components/pages/LegalPage"));
const FeedBack = lazy(() => import("../components/pages/feedback"));
const Report = lazy(() => import("../components/pages/Report"));
const FeaturedProducts = lazy(() => import("../components/MainContents/products/featuredProducts"));
const BlogList = lazy(() => import("../components/blog/BlogList"));
const BlogDetail = lazy(() => import("../components/blog/BlogDetail"));
const FavoriteRestaurants = lazy(() => import("../components/pages/FavoriteRestaurants"));

function DefaultLayout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // useEffect(() => {
  //   const init = async () => {
  //     try {  
  //       await Promise.all([
  //         fetch("/api/init-cart"),
  //       ]);
  //     } catch (err) {
  //       console.error(err);
  //       setError("Không thể tải dữ liệu");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   init();
  // }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        await fetch("/api/init-cart").catch(() => {});
      } catch (error) {
        console.error("Lỗi init:", error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  return (
    <main className="site-shell">
      <Header />

      <div className="site-main">
        <Suspense fallback={<TopProgressBar />}>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:slugCategory" element={<ProductCategoryPage />} />
            <Route path="/restaurant/:restaurantSlug/products/detail/:slugProduct" element={<ProductDetail />} />
            <Route path="/search" element={<SearchProduct />} />
            <Route path="/featured" element={<FeaturedProducts />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cart/checkout" element={<CheckoutCart />} />
            <Route path="/cart/checkout/success/:orderId" element={<OrderSuccess />} />
            <Route path="/orders" element={<DoneOrder />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/restaurant/register" element={<RestaurantRegister />} />
            <Route path="/restaurant/:restaurantSlug/products" element={<RestaurantProducts />} />
            <Route path="/restaurant/:restaurantSlug/book-table" element={<BookTable />} />
            <Route path="/restaurant/manage" element={<RestaurantManagement />} />
            <Route path="/user/settings" element={<UserSettings />} />
            <Route path="/user/vouchers" element={<UserVouchers />} />
            <Route path="/legal/:policyType" element={<LegalPage />} />
            <Route path="/user/feedback" element={<FeedBack />} />
            <Route path="/user/reports" element={<Report />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/favorites" element={<FavoriteRestaurants />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}

export default DefaultLayout;