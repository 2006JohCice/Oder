import { useEffect, useState } from "react";
import "../../css/shared/admin-components.css";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import {confirmApp} from "../../../shared/notifications/ConfirmProvider";

const formatCurrency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="adm-pagination">
      <button className="adm-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><i className="bi bi-chevron-left" /></button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} className={`adm-page-btn ${page === p ? "adm-page-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button className="adm-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><i className="bi bi-chevron-right" /></button>
    </div>
  );
};

const ProductsBackUp = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProductsBackUp = () => {
    setLoading(true);
    apiFetch("/api/admin/backup/products")
      .then((data) => {
        setProducts(Array.isArray(data.backUpProductsData) ? data.backUpProductsData : []);
        setTotalPages(data.objPagination?.totalPages || 1);
      })
      .catch((err) => { if (err.status === 401) navigate("/admin/auth/login"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProductsBackUp(); }, [page]);

  const handleRestore = async (id) => {
    if (!(await confirmApp("Xác nhận", "Khôi phục sản phẩm này?"))) return;
    try {
      const res = await fetch(`/api/admin/backup/products/back/${id}`, { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { notifyApp(data.message || "Khôi phục thất bại", "error"); return; }
      notifyApp(data.message || "Khôi phục thành công", "success");
      fetchProductsBackUp();
    } catch { notifyApp("Lỗi khôi phục", "error"); }
  };

  const handleDelete = async (id) => {
    if (!(await confirmApp("Xác nhận", "CẢNH BÁO: Xóa vĩnh viễn không thể khôi phục. Tiếp tục?"))) return;
    try {
      const res = await fetch(`/api/admin/backup/products/delete/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { notifyApp(data.message || "Xóa vĩnh viễn thất bại", "error"); return; }
      notifyApp(data.message || "Xóa vĩnh viễn thành công", "success");
      fetchProductsBackUp();
    } catch { notifyApp("Lỗi xóa", "error"); }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-trash3" style={{ color: "var(--adm-danger)", marginRight: 8 }} />
            Thùng rác sản phẩm
          </h1>
          <p className="adm-page-sub">Khôi phục hoặc xóa vĩnh viễn các sản phẩm đã xóa khỏi hệ thống</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title"><i className="bi bi-list-ul" /> Sản phẩm đã xóa</span>
          <span className="adm-badge adm-badge--grey">{products.length} sản phẩm</span>
        </div>
        
        <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>STT</th>
                <th style={{ width: 60 }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th className="adm-th-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="adm-loading-row"><td colSpan="6"><div className="adm-spinner" /><div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải...</div></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6"><div className="adm-empty"><div className="adm-empty-icon"><i className="bi bi-inbox" /></div><div className="adm-empty-text">Thùng rác trống</div></div></td></tr>
              ) : (
                products.map((item, index) => (
                  <tr key={item._id}>
                    <td className="adm-row-idx">{index + 1}</td>
                    <td>
                      {item.img ? <img src={item.img} alt={item.name} className="adm-product-img" /> : <div className="adm-product-img-placeholder"><i className="bi bi-image" /></div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--adm-text)" }}>{item.name}</div>
                    </td>
                    <td><span className="adm-price">{formatCurrency(item.price)}</span></td>
                    <td><span className="adm-badge adm-badge--grey">{item.category}</span></td>
                    <td className="adm-td-center">
                      <div className="adm-actions" style={{ justifyContent: "center" }}>
                        <button className="adm-btn adm-btn--info" onClick={() => handleRestore(item._id)} style={{ background: "var(--adm-info)", color: "white" }}>
                          <i className="bi bi-arrow-counterclockwise" /> Khôi phục
                        </button>
                        <button className="adm-btn adm-btn--danger" onClick={() => handleDelete(item._id)}>
                          <i className="bi bi-trash-fill" /> Xóa vĩnh viễn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default ProductsBackUp;
