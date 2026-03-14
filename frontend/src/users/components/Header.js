import "../css/header/header.css";
import { useState, useEffect } from "react";
import ListFood from "./MainContents/navBarFood/listFoodnavbar.js";
import Search from "./MainContents/search/search.js";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "./mixi/cart/CartContext.js";

function Header() {
  const { totalQuantity, fetchCart } = useCart();
 useEffect(() => { fetchCart(); }, []);

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/user/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);
  // console.log("user",user)
  const handlLogout = async () => {
    try {
      const res = await fetch('/api/user/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        setUser(null);
        navigate('/user/auth/login');
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

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


          <ListFood data={data} totalQuantity={totalQuantity} />


        </div>

        <div className="header-right col-xl-3 col-lg-3 col-md-10">
          <div className="header-right-children " >
            <span className="phone-number">0569 847 809</span>
            <div>
              {
                user ? (
                  <>
                    <span className="user-name">{user.name}</span>
                    
                      <button type="button" className="btn btn-sm btnSign" onClick={handlLogout}>Đăng Xuất</button>
                  
                  </>
                ) : (
                  <Link to='/user/auth/login'>
                    <button type="button" className="btn btn-sm btnSign">Đăng Nhập</button>
                  </Link>
                )
              }
            </div>
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

      <Search />

    </>
  );
}

export default Header;
