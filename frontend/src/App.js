
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./users/layouts/default";
import AdminLayout from "./admin/layouts/AdminLayout";
import NotFound from './Error/NotFound';
import LayoutDefault from './admin/components/auth/layoutAuth';
import ScrollToTop from './ScrollToTop';
function App() {


  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/admin/auth/*" element={<LayoutDefault />} />

        <Route path="/*" element={<DefaultLayout />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );



}

export default App;