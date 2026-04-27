import { Link } from "react-router-dom";

function MenuItem({ item }) {
  const hasChildren = Array.isArray(item?.children) && item.children.length > 0;

  return (
    <li className={hasChildren ? "nav-submenu-item" : ""}>
      <Link to={`/products/${item.slug}`} className="nav-dropdown-link no-underline ">
        <span>{item.name}</span>
        {hasChildren && <i className="bi bi-chevron-right" />}
      </Link>

      {hasChildren && (
        <ul className="nav-submenu">
          {item.children.map((child) => (
            <MenuItem key={child._id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default MenuItem;
