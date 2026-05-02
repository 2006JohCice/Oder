import "../css/header/header.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListFood from "./MainContents/navBarFood/listFoodnavbar";
import Search from "./MainContents/search/search";
import { useCart } from "./mixi/cart/CartContext";

function Header() {
  const { totalQuantity, fetchCart } = useCart();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));

    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const handleLogout = async () => {
    const res = await fetch("/api/user/logout", {
      method: "GET",
      credentials: "include",
    });

    if (res.ok) {
      setUser(null);
      navigate("/user/auth/login");
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="topbar">
        <span>Không Gian Hiện Đại, Đặt Món & Bàn Sớm Trong Vài Phút.</span>
        <span>CSKH-TEL: 0569847809</span>
        <span>FEEDBACK-Email: nhatluong1252006@gmail.com</span>
        <Link to="/cart/checkout?mode=table" className="no-underline">Đặt Bàn Ngay</Link>
      </div>

      <header className="app-header">
        <div className="brand-group">
          <Link to="/" className="logo no-underline ">
            Oder
          </Link>
          <span className="brand-subtitle">Food and table</span>
        </div>

        <div className={`desktop-nav ${menuOpen ? "is-open" : ""}`}>
         
          <ListFood data={categories} totalQuantity={totalQuantity} onNavigate={closeMenu} />
        </div>

        <div className="header-actions">
          <Link to="/cart/checkout?mode=table" className="header-cta no-underline " >
            <i className="bi bi-calendar2-week" />
            Đặt Bàn
          </Link>

          <Link to="/cart" className="header-cart no-underline ">
            <i className="bi bi-bag-check" />
            <span>{totalQuantity}</span>
          </Link>

          <div className="user-chip">
            <i className="bi bi-person-circle" />
            {user ? (
              <>
                <span>{user.name}</span>
                <button type="button" onClick={handleLogout}>
                  Đăng Xuất
                </button>
              </>
            ) : (
              <Link to="/user/auth/login" className="no-underline">Đăng Nhập</Link>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Mo menu"
          >
            <i className="bi bi-list" />
          </button>
        </div>
      </header>

      <Search />
    </>
  );
}

export default Header;
