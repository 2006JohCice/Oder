import ButtonNotifi from "../helpers/buttonNotifi";
import { Link } from "react-router-dom";
import { prefixAdmin } from "../../config/system";

function HeaderAdmin({ query, setQuery, setMenuOpen, user }) {
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
          <span>
            <i className="bi bi-search"></i>
          </span>
          <input
            placeholder="Tim nguoi dung, san pham, don hang..."
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
            <i className="bi bi-person-circle"></i>
            <span>{user?.fullname || "Admin"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderAdmin;
