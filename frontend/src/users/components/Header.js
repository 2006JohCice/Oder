import "../css/header/header.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./mixi/cart/CartContext";
import { useTranslation } from "react-i18next";

function Header() {
  const { t, i18n } = useTranslation();
  const { totalQuantity } = useCart();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    // Detect IP location for first time visitors
    if (!localStorage.getItem('app_lang')) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          let lang = 'en';
          if (data.country_code === 'VN') lang = 'vi';
          if (data.country_code === 'KR') lang = 'ko';
          if (data.country_code === 'IT') lang = 'it';
          i18n.changeLanguage(lang);
          localStorage.setItem('app_lang', lang);
        })
        .catch(err => console.error("IP detect err", err));
    }
    const loadUserAndRestaurant = async () => {
      try {
        const userRes = await fetch("/api/user/me", { credentials: "include" });
        if (!userRes.ok) {
          setUser(null);
          setHasRestaurant(false);
          return;
        }

        const userData = await userRes.json();
        const currentUser = userData?.user || null;
        setUser(currentUser);

        if (!currentUser) {
          setHasRestaurant(false);
          return;
        }

        if (currentUser.role !== "owner" && !currentUser.restaurant_id) {
          setHasRestaurant(false);
          return;
        }

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
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
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
      <header className="gp-header">
        {/* TOP ROW */}
        <div className="gp-header-top">
          <div className="gp-brand">
            <button className="gp-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <i className="bi bi-list"></i>
            </button>
            <Link to="/" className="gp-logo-link">
              <span className="gp-logo-text">Gourmet Pulse</span>
            </Link>
          </div>

          <nav className={`gp-nav-main ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <button className="gp-close-mobile-menu" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
            <Link to="/" className={`gp-nav-link ${pathname === '/' ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
            <Link to="/restaurants" className={`gp-nav-link ${pathname === '/restaurants' && !location.search.includes('mode=booking') ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Nhà hàng</Link>
            <Link to="/restaurants?mode=booking" className={`gp-nav-link ${location.search.includes('mode=booking') ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Đặt bàn</Link>
            <Link to="/featured" className={`gp-nav-link ${pathname.includes('/featured') ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Món nổi bật</Link>
            <Link to="/favorites" className={`gp-nav-link ${pathname.includes('/favorites') ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Yêu thích</Link>
            <Link to="/user/vouchers" className={`gp-nav-link ${pathname.includes('/user/vouchers') ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Voucher</Link>
            <Link to="/blog" className={`gp-nav-link ${pathname.includes('/blog') ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Tin tức</Link>
            <Link to="/orders" className={`gp-nav-link ${pathname.includes('/orders') || pathname.includes('success') ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t('header.orders')}</Link>
            <Link to="/cart/checkout" className={`gp-nav-link ${pathname === '/cart/checkout' ? 'gp-active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-cart3"></i> {t('header.cart')} ({totalQuantity})
            </Link>
          </nav>

          {isMobileMenuOpen && <div className="gp-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

          <div className="gp-header-right">
            {user ? (
              <div className="gp-user-menu" ref={userMenuRef}>
                <button 
                  className="gp-user-toggle"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '18px' }}
                >
                  <i className="bi bi-person-circle"></i> <i className="bi bi-chevron-down" style={{fontSize: '12px', marginTop: '2px'}}></i>
                </button>
                {userMenuOpen && (
                  <ul className="gp-dropdown">
                    {hasRestaurant ? (
                      <li><Link to="/restaurant-owner">Quản lý cửa hàng</Link></li>
                    ) : (
                      <li><Link to="/restaurant/register">Đăng ký cửa hàng</Link></li>
                    )}
                    <li><Link to="/user/settings">{t('header.my_account')}</Link></li>
                    <li><button onClick={handleLogout}>{t('header.logout')}</button></li>
                  </ul>
                )}
              </div>
            ) : (
              <Link to="/user/auth/login" className="gp-login-link">{t('header.login')} / {t('header.register')}</Link>
            )}
            
            <div className="gp-user-menu" ref={langMenuRef}>
              <div 
                className="gp-lang-selector" 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                {i18n.language.toUpperCase()} <i className="bi bi-chevron-down"></i>
              </div>
              {langMenuOpen && (
                <ul className="gp-dropdown" style={{ right: 0, left: 'auto', minWidth: '100px' }}>
                  <li><button onClick={() => { i18n.changeLanguage('vi'); localStorage.setItem('app_lang', 'vi'); setLangMenuOpen(false); }}>🇻🇳 Tiếng Việt</button></li>
                  <li><button onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('app_lang', 'en'); setLangMenuOpen(false); }}>🇬🇧 English</button></li>
                  <li><button onClick={() => { i18n.changeLanguage('ko'); localStorage.setItem('app_lang', 'ko'); setLangMenuOpen(false); }}>🇰🇷 한국어</button></li>
                  <li><button onClick={() => { i18n.changeLanguage('it'); localStorage.setItem('app_lang', 'it'); setLangMenuOpen(false); }}>🇮🇹 Italiano</button></li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (CATEGORIES) */}
        <div className="gp-header-bottom">
          <button className="gp-more-categories">
            Xem thêm <i className="bi bi-grid-fill"></i>
          </button>
          
          <div className="gp-categories-scroll">
            {categories.map((cat, index) => (
               <Link to={`/search?keyword=${encodeURIComponent(cat.name)}`} key={index} className="gp-category-chip">{cat.name}</Link>
            ))}
          </div>
        </div>
      </header>

    </>
  );
}

export default Header;
