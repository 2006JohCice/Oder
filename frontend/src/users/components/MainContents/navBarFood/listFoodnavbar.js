/* eslint-disable unicode-bom */
import { Link } from "react-router-dom";
import MenuItem from "./MenuItem";

function ListFood({ data, totalQuantity, onNavigate }) {
  return (
    <nav className="site-nav">
      <div className="nav-dropdown">
        <button type="button" className="nav-link nav-link-button">
          Danh mục
          <i className="bi bi-chevron-down" />
        </button>

        <ul className="nav-dropdown-menu">
          <li>
            <Link to="/products" className="nav-dropdown-link no-underline" onClick={onNavigate}>
              Xem thêm
            </Link>
          </li>
          {Array.isArray(data) && data.map((item) => <MenuItem key={item._id} item={item} />)}
        </ul>
      </div>

      <Link to="/" className="nav-link no-underline" onClick={onNavigate}>
        Trang chủ
      </Link>
      <Link to="/restaurants" className="nav-link no-underline" onClick={onNavigate}>
        Nhà hàng
      </Link>
      <Link to="/products" className="nav-link no-underline" onClick={onNavigate}>
        Món nổi bật
      </Link>
      <Link to="/cart/checkout?mode=table" className="nav-link no-underline" onClick={onNavigate}>
        Đặt bàn
      </Link>
      <Link to="/cart/doneOrder" className="nav-link no-underline" onClick={onNavigate}>
        Đơn đặt 
      </Link>
      <Link to="/cart" className="nav-link nav-cart-link no-underline" onClick={onNavigate}>
        Giỏ hàng
        <span className="nav-badge">{totalQuantity}</span>
      </Link>
    </nav>
  );
}

export default ListFood;
