import { Link } from "react-router-dom";
import MenuItem from "./MenuItem"

function ListFood({ data, patch, totalQuantity }) {

  return (
    <nav className="main-nav">
      <div className="dropdown">
        <Link
          className="dropdown-toggle"
          data-bs-toggle="dropdown"
          role="button"
          to={`/products`}
        >
          Danh mục
        </Link>

        <ul className="dropdown-menu">
          <Link
            to={`/products`}
            style={
              { display: "block" }
            }
          >
            Danh mục
          </Link>
          {Array.isArray(data) && data?.map(item => (
            <MenuItem key={item._id} item={item} />
          ))}
        </ul>
      </div>




      <Link to="/products">Nhà hàng uy tín</Link>
      <a href="#">Ưu đãi hot</a>
      <a href="#">Mới nhất</a>


      {/* ===== BLOG ===== */}
      <div className="dropdown">
        <a
          className="dropdown-toggle"
          data-bs-toggle="dropdown"
          role="button"
        >
          Tin tức & Blog
        </a>

        <ul className="dropdown-menu">
          <li><a className="dropdown-item">Sự kiện ẩm thực</a></li>
          <li><a className="dropdown-item">Khuyến mãi</a></li>
          <li><a className="dropdown-item">Review nhà hàng</a></li>
          <li><a className="dropdown-item">Công thức món ngon</a></li>
        </ul>
      </div>
      <Link to="/cart" className="position-relative">
        Giỏ Hàng
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{marginTop: "15px"}}>
          ({totalQuantity})
        </span>
      </Link>

       <Link to="/cart/doneOrder" className="position-relative">
        Các Đơn Đã Đặt
      </Link>
     

    </nav>
  );
}

export default ListFood;

