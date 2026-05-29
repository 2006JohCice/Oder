import { useState, useEffect } from "react";
import "../../css/creatProduct/CreateProducts.css";
import ListCategory from "../AddCategory/list-category";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function CreateProducts({ setProducts, setLoading }) {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPercentage: "",
    stock: "",
    img: "",
    position: "",
    status: "active",
    category: "",
    featured: "0",
    restaurant_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () =>
    setFormData({
      name: "",
      description: "",
      price: "",
      discountPercentage: "",
      stock: "",
      img: "",
      position: "",
      status: "active",
      category: "",
      featured: "0",
      restaurant_id: "",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const dataResponse = await res.json();

      if (!res.ok) {
        notifyApp(dataResponse?.message || "Không thể tạo sản phẩm", "error");
        return;
      }

      setLoading?.(true);
      setProducts((prev) => [dataResponse.product, ...prev]);
      resetForm();
      notifyApp(dataResponse.message || "Tạo sản phẩm thành công", "success");
    } catch (error) {
      notifyApp("Có lỗi khi tạo sản phẩm", "error");
    }
  };

  useEffect(() => {
    fetch("/api/admin/products/create", { credentials: "include" })
      .then((res) => res.json())
      .then((res) => {
        setCategories(Array.isArray(res.categories) ? res.categories : []);
        setRestaurants(Array.isArray(res.restaurants) ? res.restaurants : []);
      })
      .catch(() => {
        setCategories([]);
        setRestaurants([]);
      });
  }, []);

  return (
    <div
      className="offcanvas offcanvas-start createProducts-offcanvas"
      tabIndex="-1"
      id="offcanvasWithBackdrop"
      aria-labelledby="offcanvasWithBackdropLabel"
    >
      <div className="offcanvas-header createProducts-header">
        <h5 className="offcanvas-title" id="offcanvasWithBackdropLabel">
          Tạo sản phẩm
        </h5>
        <button
          type="button"
          className="btn-close btn-close-white"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      <div className="offcanvas-body createProducts-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-box-seam"></i> Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-shop"></i> Nhà hàng</label>
            <select
              name="restaurant_id"
              className="admin-select"
              style={{ width: "100%" }}
              value={formData.restaurant_id}
              onChange={handleChange}
              required
            >
              <option value="">Chọn nhà hàng</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-tags"></i> Danh mục</label>
            <select
              name="category"
              className="admin-select"
              style={{ width: "100%" }}
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((item) => <ListCategory key={item._id} node={item} />)}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-star"></i> Hiển thị</label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="featured"
                  value="1"
                  checked={formData.featured === "1"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Nổi bật</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="featured"
                  value="0"
                  checked={formData.featured === "0"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Thường</label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-text-paragraph"></i> Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control createProducts-input"
              rows="3"
              placeholder="Nhập mô tả..."
            ></textarea>
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label"><i className="bi bi-currency-dollar"></i> Giá</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control createProducts-input"
                placeholder="Giá gốc"
                required
                min="1"
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label"><i className="bi bi-percent"></i> Giảm giá (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                className="form-control createProducts-input"
                placeholder="Giảm giá"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-boxes"></i> Số lượng</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Nhập số lượng"
              required
              min="0"
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-image"></i> Ảnh (URL)</label>
            <input
              type="url"
              name="img"
              value={formData.img}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Dán link ảnh"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-sort-numeric-down"></i> Vị trí</label>
            <input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Nhập vị trí hiển thị"
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-toggle-on"></i> Trạng thái</label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === "active"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Hoạt động</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === "inactive"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Tạm dừng</label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn createProducts-btn">
            <i className="bi bi-plus-circle"></i> Tạo mới
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProducts;
