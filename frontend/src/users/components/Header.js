import "../css/header/header.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListFood from "./MainContents/navBarFood/listFoodnavbar";
import Search from "./MainContents/search/search";
import { useCart } from "./mixi/cart/CartContext";

function Header() {
  const { totalQuantity } = useCart();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAndRestaurant = async () => {
      try {
        const userRes = await fetch("/api/user/me", { credentials: "include" });
        if (!userRes.ok) {
          setUser(null);
          setHasRestaurant(false);
          return;
        }

        const userData = await userRes.json();
        setUser(userData?.user || null);

        const restaurantRes = await fetch("/api/restaurant/my", { credentials: "include" });
        setHasRestaurant(restaurantRes.ok);
      } catch (error) {
        setUser(null);
        setHasRestaurant(false);
      }
    };

    loadUserAndRestaurant();

    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    const res = await fetch("/api/user/logout", {
      method: "GET",
      credentials: "include",
    });

    if (res.ok) {
      setUser(null);
      setUserMenuOpen(false);
      navigate("/user/auth/login");
    }
  };

  return (
    <>
      <div className="topbar">
        <span>Khong gian hien dai, dat mon va dat ban nhanh.</span>
        <span>CSKH-TEL: 0569847809</span>
        <span>FEEDBACK-Email: nhatluong1252006@gmail.com</span>
        <Link to="/cart/checkout?mode=table" className="no-underline">Dat ban ngay</Link>
      </div>

      <header className="app-header">
        <div className="brand-group">
          <Link to="/" className="logo no-underline">Order</Link>
          <span className="brand-subtitle">Food and table</span>
        </div>

        <div className={`desktop-nav ${menuOpen ? "is-open" : ""}`}>
          <ListFood data={categories} totalQuantity={totalQuantity} onNavigate={() => setMenuOpen(false)} />
        </div>

        <div className="header-actions">
          <Link to="/cart/checkout?mode=table" className="header-cta no-underline">
            <i className="bi bi-calendar2-week" />
            Đặt Bàn
          </Link>

          <Link to="/cart" className="header-cart no-underline">
            <i className="bi bi-bag-check" />
            <span>{totalQuantity}</span>
          </Link>

          {/* {user && (
            <Link to="/user/settings" className="header-settings no-underline" title="Cài đặt tài khoản">
              <i className="bi bi-gear" />
            </Link>
          )} */}

          <div className="user-chip" ref={userMenuRef}>
            <i className="bi bi-person-circle" />
            {user ? (
              <div className="user-menu-wrap">
                <button type="button" className="user-menu-toggle" onClick={() => setUserMenuOpen((prev) => !prev)}>
                  {user.fullname || user.name}
                  <i className="bi bi-chevron-down" />
                </button>
                {userMenuOpen && (
                  <ul className="user-dropdown-menu">
                    {hasRestaurant && (
                      <li>
                        <Link to="/restaurant/manage" onClick={() => setUserMenuOpen(false)}>
                          Chuyên Quản Lý
                        </Link>
                      </li>
                    )}
                    {user && (
                      <li>
                        <Link to="/user/settings" className="header-settings no-underline" title="Cài đặt tài khoản">
                          Settings
                        </Link>
                      </li>
                    )}

                    <li>
                      <button type="button" onClick={handleLogout}>Đăng Xuất</button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link to="/user/auth/login" className="no-underline">Đăng nhập</Link>
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
