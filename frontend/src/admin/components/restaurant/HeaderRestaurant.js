import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/HeaderRestaurant.css";

const HeaderRestaurant = ({ menuOpen, setMenuOpen }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    const res = await fetch("/api/user/logout", {
      method: "GET",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/";
    }
  };

  return (
    <header className="header-restaurant">
      <div className="header-left">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Mở menu"
        >
          <i className="bi bi-list"></i>
        </button>

        <h1 className="header-title">Quản lý nhà hàng</h1>
      </div>

      <div className="header-right">
        <div className="user-info">
          <i className="bi bi-person-circle"></i>
          {user ? (
            <>
              <span>{user.name || user.fullname}</span>
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/user/auth/login" className="login-link">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderRestaurant;
