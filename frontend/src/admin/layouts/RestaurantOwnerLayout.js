import React, { useEffect, useState } from "react";
import "../layouts/RestaurantOwnerLayout.css";
import "../css/admin.css";
import SidebarRestaurant from "../components/restaurant/SidebarRestaurant";
import HeaderRestaurant from "../components/restaurant/HeaderRestaurant";
import { Routes, Route, useNavigate } from "react-router-dom";
import RestaurantProducts from "../components/restaurant/RestaurantProducts";
import RestaurantDashboard from "../components/restaurant/RestaurantDashboard";
import RestaurantOrders from "../components/restaurant/RestaurantOrders";
import RestaurantFeedbacks from "../components/restaurant/RestaurantFeedbacks";
import RestaurantReports from "../components/restaurant/RestaurantReports";
import RestaurantSettings from "../components/restaurant/RestaurantSettings";
import RestaurantTables from "../components/restaurant/RestaurantTables";

export default function RestaurantOwnerLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const userRes = await fetch("/api/user/me", { credentials: "include" });
      if (!userRes.ok) {
        navigate("/user/auth/login");
        return;
      }

      const userData = await userRes.json();
      setUser(userData.user);

      const restaurantRes = await fetch("/api/restaurant/my", { credentials: "include" });
      if (restaurantRes.status === 404) {
        navigate("/restaurant/register");
        return;
      }
      if (restaurantRes.status === 403) {
        navigate("/");
        return;
      }
      if (!restaurantRes.ok) {
        navigate("/");
        return;
      }

      const restaurantData = await restaurantRes.json();
      setRestaurant(restaurantData.restaurant);
    } catch (error) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !restaurant) {
    return <div className="loading">Đang tải dữ liệu quản lý nhà hàng...</div>;
  }

  return (
    <div className="restaurant-owner-app">
      <div className="restaurant-owner-container">
        <SidebarRestaurant menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div className="restaurant-owner-main">
          <HeaderRestaurant menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <div className="restaurant-owner-content">
            <Routes>
              <Route path="/" element={<RestaurantDashboard restaurant={restaurant} />} />
              <Route path="/products" element={<RestaurantProducts restaurant={restaurant} />} />
              <Route path="/orders" element={<RestaurantOrders restaurant={restaurant} />} />
              <Route path="/feedbacks" element={<RestaurantFeedbacks restaurant={restaurant} />} />
              <Route path="/reports" element={<RestaurantReports restaurant={restaurant} />} />
              <Route path="/tables" element={<RestaurantTables restaurant={restaurant} />} />
              <Route path="/settings" element={<RestaurantSettings restaurant={restaurant} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
