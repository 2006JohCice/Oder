import Header from '../components/Header.js';
import MainContent from '../components/MainContent.js';
import { Routes, Route } from 'react-router-dom';
import Footed from '../components/foot/footed.js';
import "../js/index.js";
import Cart from '../pages/cart.js';
import ProductsList from '../components/products/productList.js';
import ProductCategoryPage from '../pages/ProductForCategory.js';
import ProductDetail from '../components/detailProducts/detailProducts.js';
import SearchProduct from '../components/listSearchProducts/searchProducts.js';
import OrderSuccess from '../pages/success.js';
import { useEffect, useState } from "react";
import CheckoutCart from '../pages/checkoutCart.js';
import DoneOrder from '../pages/doneOrder.js';
function DefaultLayout() {
  const [totalQuantity,setTotalQuantity] = useState([]);
  useEffect(() => {
    fetch("/api/init-cart")
      .then(res => res.json())
      .then(res => {
      
        setTotalQuantity(res);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <>

      <main className="main-content col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">


        <div className="app-container">
          <Header totalQuantity={totalQuantity} />
        </div>

        <div className="app-body">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path='/products' element={<ProductsList />} />
            <Route path='/products/:slugCategory' element={<ProductCategoryPage />} />
            <Route path='/products/detail/:slugProduct' element={<ProductDetail />} />
            <Route path='/search' element={<SearchProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path='/cart/checkout' element={<CheckoutCart/>}/>
            <Route path ='/cart/checkout/success/:orderId' element={<OrderSuccess/>}/>
            <Route path='/cart/doneOrder' element={<DoneOrder/>}/>
          </Routes>
        </div>
        <div className='app-footer'>
          {/* <Footed /> */}
        </div>

      </main>
    </>
  );
}

export default DefaultLayout;
