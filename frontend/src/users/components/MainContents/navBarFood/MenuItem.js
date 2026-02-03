import { Link } from "react-router-dom";

function MenuItem({ item }) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  return (
    <li className={hasChildren ? "dropdown-submenu" : ""}>
      <Link 
        to = {`/products/${item.slug}`}
      
      className="dropdown-item">
        {item.name}
        {hasChildren && " ▸"}
      </Link>

      {hasChildren && (
        <ul className="dropdown-menu">
          {item && item?.children.map(child => (
            <MenuItem key={child._id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default MenuItem;
