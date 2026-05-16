import { useEffect, useState } from "react";
import "../../css/products/ProductsAdmin.css";
import PaginationHelper from "../../helpers/pagination";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import { formatCurrency } from "../../../users/utils/shop";

const ProductsBackUp = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProductsBackUp = () => {
    apiFetch("/api/admin/backup/products")
      .then((data) => {
        setProducts(Array.isArray(data.backUpProductsData) ? data.backUpProductsData : []);
        setTotalPages(data.objPagination?.totalPages || 1);
      })
      .catch((err) => {
        if (err.status === 401) {
          navigate("/admin/auth/login");
        }
      });
  };

  useEffect(() => {
    fetchProductsBackUp();
  }, [page]);

  const handleRestore = async (id) => {
    const res = await fetch(`/api/admin/backup/products/back/${id}`, {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      notifyApp(data.message || "Khôi phục thất bại", "error");
      return;
    }
    notifyApp(data.message || "Khôi phục thành công", "success");
    fetchProductsBackUp();
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/backup/products/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      notifyApp(data.message || "Xóa vĩnh viễn thất bại", "error");
      return;
    }
    notifyApp(data.message || "Xóa vĩnh viễn thành công", "success");
    fetchProductsBackUp();
  };

  return (
    <div className="products-page">
      <div className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h3>Sản phẩm đã xóa</h3>
            <div className="admin-muted">Khôi phục hoặc xóa vĩnh viễn sản phẩm khỏi hệ thống.</div>
          </div>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td><img src={item.img} alt={item.name} className="storyHome-img" /></td>
                <td>{item.name}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.category}</td>
                <td style={{ display: "flex", gap: "8px" }}>
                  <button className="admin-btn" onClick={() => handleRestore(item._id)}>
                    Khôi phục
                  </button>
                  <button className="admin-btn" onClick={() => handleDelete(item._id)}>
                    Xóa vĩnh viễn
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationHelper totalPages={totalPages} page={page} setPage={setPage} />
    </div>
  );
};

export default ProductsBackUp;
