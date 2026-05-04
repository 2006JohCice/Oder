import ButtonNotifi from "../helpers/buttonNotifi";
import { Link } from "react-router-dom";
import { prefixAdmin } from "../../config/system";

function HeaderAdmin({ query, setQuery, setMenuOpen, user, theme, setTheme, searchType, setSearchType }) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button type="button" className="admin-mobile-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
          <i className="bi bi-list"></i>
        </button>
        <div>
          <div className="admin-topbar-title">Restaurant Dashboard</div>
          <div className="admin-topbar-sub">
            Quan ly nha hang, thuc don, ban an va tai khoan trong mot giao dien responsive.
          </div>
        </div>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-search">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="admin-select"
            style={{ width: 'auto', marginRight: '10px' }}
          >
            <option value="all">Tất cả</option>
            <option value="order">Mã Order</option>
            <option value="user">User</option>
            <option value="account">Account</option>
            <option value="restaurant">Tên Restaurant</option>
          </select>
          <span>
            <i className="bi bi-search"></i>
          </span>
          <input
            placeholder={`Tìm ${searchType === 'all' ? 'người dùng, sản phẩm, đơn hàng...' : searchType}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="admin-actions">
          <ButtonNotifi />
          <button className="admin-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`}></i>
          </button>
          <Link to={`${prefixAdmin}admin/deailCloud`}>
            <button className="admin-btn">
              <i className="bi bi-cloud"></i>
            </button>
          </Link>
          <div className="admin-user-chip">
            <i className="bi bi-person-circle"></i>
            <span>{user?.fullname || "Admin"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderAdmin;
