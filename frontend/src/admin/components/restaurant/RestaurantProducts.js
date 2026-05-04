import { useEffect, useState } from "react";
import "../../css/RestaurantProducts.css";

const initialForm = {
  name: "",
  price: "",
  description: "",
  img: "",
  category_id: "",
};

const RestaurantProducts = ({ restaurant }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/products", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Load products failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurant?._id) loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?._id]);

  const resetForm = () => {
    setEditing(null);
    setFormData(initialForm);
    setShowForm(false);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const endpoint = editing ? `/api/restaurant/products/${editing._id}` : "/api/restaurant/products";
      const method = editing ? "PUT" : "POST";
      const payload = { ...formData, price: Number(formData.price || 0) };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Lưu sản phẩm thành công");
        resetForm();
        loadProducts();
      } else {
        alert(data.message || "Lưu sản phẩm thất bại");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditing(product);
    setFormData({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      img: product.img || "",
      category_id: product.category_id || "",
    });
    setShowForm(true);
  };

  const deleteProduct = async (productId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const res = await fetch(`/api/restaurant/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Đã xóa sản phẩm");
        loadProducts();
      } else {
        alert(data.message || "Xóa sản phẩm thất bại");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  if (loading) return <div className="loading">Đang tải sản phẩm...</div>;

  return (
    <div className="restaurant-products-admin">

        

      <div className="page-header">
        <h2>Quản lý sản phẩm - {restaurant?.name}</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="bi bi-plus-circle"></i> Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="modal-crud-adminUser">
          <div className="modal-crud-adminUser-content">
            <h3>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
            <form onSubmit={submitForm}>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Giá *</label>
                <input type="number" min="1000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
              </div>
              <div className="form-group">
                <label>Ảnh (URL)</label>
                <input type="text" value={formData.img} onChange={(e) => setFormData({ ...formData, img: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Mã danh mục</label>
                <input type="text" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )} 

      <div className="products-table-container">
        <table className="admin-table-users">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td><img src={product.img || "/default-food.jpg"} alt={product.name} className="product-thumb" /></td>
                <td>{product.name}</td>
                <td>{Number(product.price || 0).toLocaleString("vi-VN")} đ</td>
                <td className="description-cell">{product.description || "-"}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-edit" onClick={() => editProduct(product)}>Sửa</button>
                    <button className="btn btn-delete" onClick={() => deleteProduct(product._id)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantProducts;
