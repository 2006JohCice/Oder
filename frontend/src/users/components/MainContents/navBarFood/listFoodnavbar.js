import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuItem from "./MenuItem";
function ListFood({ data, totalQuantity, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  return (
    <nav className="site-nav">
      <div className="nav-dropdown">
        <button type="button" className="nav-link nav-link-button">
          Danh mục
          <i className="bi bi-chevron-down" />
        </button>

        <ul className="nav-dropdown-menu">
          <li>
            <Link to="/products" className="nav-dropdown-link no-underline " onClick={onNavigate}>
              Xem Thực Đơn
            </Link>
          </li>
          {Array.isArray(data) &&
            data.map((item) => (
              <MenuItem key={item._id} item={item} />
            ))}
        </ul>
      </div>

      <Link to="/" className="nav-link no-underline " onClick={onNavigate}>
        Trang chủ
      </Link>
      <Link to="/restaurants" className="nav-link no-underline" onClick={closeMenu}>
        Nhà Hàng
      </Link>
      <Link to="/products" className="nav-link no-underline " onClick={onNavigate}>
        Món nổi bật
      </Link>
      <Link to="/cart/checkout?mode=table" className="nav-link no-underline " onClick={onNavigate}>
        Đặt Bàn
      </Link>
      <Link to="/cart/doneOrder" className="nav-link no-underline " onClick={onNavigate}>
        Đơn Đặt
      </Link>
      <Link to="/cart" className="nav-link nav-cart-link no-underline " onClick={onNavigate}>
        Giỏ Hàng
        <span className="nav-badge">{totalQuantity}</span>
      </Link>
    </nav>
  );
}

export default ListFood;
