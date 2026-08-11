import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./users/layouts/default";
import AdminLayout from "./admin/layouts/AdminLayout";
import RestaurantOwnerLayout from "./ManageRestaurant/layouts/RestaurantOwnerLayout";
import NotFound from './Error/NotFound';
import LayoutDefault from './admin/components/auth/layoutAuth';
import LayoutLoginUser from './users/components/login/layoutLogin';
import ScrollToTop from './ScrollToTop';
import { v4 as uuidv4 } from 'uuid';
import { ToastProvider } from './shared/notifications/ToastProvider';
import FloatingChatWidget from './users/components/FloatingChatWidget';
import GlobalLoading from './components/GlobalLoading';

function App() {
  useEffect(() => {
    // Analytics/Visit Tracking
    const trackVisit = async () => {
      try {
        let sessionId = localStorage.getItem("visitSessionId");
        const todayDate = new Date().toDateString();
        const lastVisitDate = localStorage.getItem("lastVisitDate");

        if (!sessionId) {
          sessionId = uuidv4();
          localStorage.setItem("visitSessionId", sessionId);
        }

        // Only track once per day per device
        if (lastVisitDate !== todayDate) {
          const userStr = localStorage.getItem("user");
          const isRegistered = !!userStr;
          
          await fetch("/api/visit/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, isRegistered })
          });
          
          localStorage.setItem("lastVisitDate", todayDate);
        }
      } catch (err) {
        console.error("Tracking error:", err);
      }
    };
    trackVisit();
  }, []);

  return (
    <BrowserRouter>
      <GlobalLoading />
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/admin/auth/*" element={<LayoutDefault />} />
        <Route path="/restaurant-owner/*" element={<RestaurantOwnerLayout />} />

        <Route path="/*" element={<DefaultLayout />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/user/auth/*' element={<LayoutLoginUser />} />
      </Routes>
      <FloatingChatWidget />
    </BrowserRouter>
  );



}

export default App;