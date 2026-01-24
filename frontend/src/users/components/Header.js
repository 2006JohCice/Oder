import "../css/header/header.css";
import { useState, useEffect } from "react";
import ListFood from "./MainContents/navBarFood/listFoodnavbar";
import Search from "./MainContents/search/search";
function Header() {


  const closeMenu = () => {
    const listMenu = document.querySelector('.list-menu');
    listMenu.classList.remove('active');
  }
  const showMenu = () => {
    const listMenu = document.querySelector('.list-menu');
    listMenu.classList.add('active');

  }


  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("/api/category")
      .then(res => res.json())
      .then(res => setData(res))
      .catch((err) => console.error("Lỗi khi lấy cây danh mục:", err));
  }, []);


  return (
    <>
      <header className="app-header">
        <div className="header-left col-xl-9 col-lg-9 col-md-2">
          <div >
            <a href="/" className="logo" style={{}}> 
              Order
            </a>
            
            
            </div>
        

          <ListFood data={data} />


        </div>

        <div className="header-right col-xl-3 col-lg-3 col-md-10">
          <div className="header-right-children " >
            <span className="phone-number">0569 847 809</span>
            <button type="button" className="btn btn-primary btn-sm">Small button</button>
          </div>

          <div className="food-icons">

            <div className="food-icon">
              <i className="bi bi-bag-check"></i>
            </div>
            <div className="food-icon">
              <i className="bi bi-basket"></i>
            </div>
            <div className="food-icon">
              <i className="bi bi-cash-coin"></i>
            </div>
            <div className="food-icon">
              <i className="bi bi-geo-alt-fill"></i>
            </div>

            <div className="food-show-menu icon-menu" onClick={showMenu}>
              <i className="bi bi-list"></i>
            </div>

          </div>

          <div className="list-menu">
            <div className="food-show-menu close-menu" onClick={closeMenu}>
              <i class="bi bi-x-lg"></i>
            </div>
            <ul className="menu-list">
              <li><a href="">TRANG CHỦ</a></li>
              <li><a href="">DỊCH VỤ</a></li>
              <li><a href="">GIỚI THIỆU</a></li>
              <li><a href="">MẪU WEB</a></li>
              <li><a href="">KIẾN THỨC</a></li>
              <li><a href="../LienHe/contact.html">LIÊN HỆ</a></li>
            </ul>
          </div>
        </div>


        

      </header>

      <Search/>

    </>
  );
}

export default Header;
