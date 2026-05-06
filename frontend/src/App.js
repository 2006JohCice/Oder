
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./users/layouts/default";
import AdminLayout from "./admin/layouts/AdminLayout";
import RestaurantOwnerLayout from "./admin/layouts/RestaurantOwnerLayout";
import NotFound from './Error/NotFound';
import LayoutDefault from './admin/components/auth/layoutAuth';
import LayoutLoginUser from './users/components/login/layoutLogin';
import ScrollToTop from './ScrollToTop';
function App() {

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/admin/auth/*" element={<LayoutDefault />} />
        <Route path="/restaurant-owner/*" element={<RestaurantOwnerLayout />} />

        <Route path="/*" element={<DefaultLayout />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/user/auth/*' element={<LayoutLoginUser />} />
      </Routes>
    </BrowserRouter>
  );



}

export default App;