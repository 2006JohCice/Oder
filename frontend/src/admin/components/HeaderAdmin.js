import ButtonNotifi from "../helpers/buttonNotifi";
import { Link } from "react-router-dom";
import { prefixAdmin } from "../../config/system";
import "../css/components/HeaderAdmin.css";

function HeaderAdmin({ query, setQuery, setMenuOpen, user, theme, setTheme, searchType, setSearchType }) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button type="button" className="admin-menu-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
          <i className="bi bi-list"></i>
        </button>
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
          <Link to={`${prefixAdmin}admin/deailCloud`}>
            <button className="admin-btn">
              <i className="bi bi-cloud"></i>
            </button>
          </Link>
          <div className="admin-user-chip">
            <img src="/logo.jpg" alt="" style={{ width: '29px', height: '29px', borderRadius: '50%', objectFit: 'cover' }} />
            <span>{user?.fullname || "John Doe"}</span>
            <i className="bi bi-chevron-down" style={{ fontSize: '10px', marginLeft: '5px' }}></i>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderAdmin;
