import { useState, useEffect } from "react";
import "../../css/creatProduct/CreateProducts.css";
import ListCategory from "../AddCategory/list-category";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function EditProducts({ idEdit, setProducts }) {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dataEdit, setDataEdit] = useState({
    name: "",
    description: "",
    price: "",
    discountPercentage: "",
    stock: "",
    img: "",
    position: "",
    status: "inactive",
    category: "",
    featured: "0",
    restaurant_id: "",
  });

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

  useEffect(() => {
    if (!idEdit) return;
    fetch(`/api/admin/products/edit/${idEdit}`, { credentials: "include" })
      .then((res) => res.json())
      .then((dataResponse) => {
        setDataEdit({
          name: dataResponse.product.name || "",
          description: dataResponse.product.description || "",
          price: dataResponse.product.price || "",
          discountPercentage: dataResponse.product.discountPercentage || "",
          stock: dataResponse.product.stock || "",
          img: dataResponse.product.img || "",
          position: dataResponse.product.position || "",
          status: dataResponse.product.status || "inactive",
          category: dataResponse.product.category || "",
          featured: dataResponse.product.featured || "0",
          restaurant_id: dataResponse.product.restaurant_id || "",
        });
      });
  }, [idEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/products/edit/${idEdit}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataEdit),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        notifyApp(payload.message || "Cập nhật sản phẩm thất bại", "error");
        return;
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) => (product._id === idEdit ? { ...product, ...dataEdit } : product))
      );
      notifyApp(payload.message || "Cập nhật sản phẩm thành công", "success");
    } catch (error) {
      notifyApp("Lỗi khi cập nhật sản phẩm", "error");
    }
  };

  return (
    <div
      className="offcanvas offcanvas-start createProducts-offcanvas"
      tabIndex="-1"
      id="offcanvasEditProduct"
      aria-labelledby="offcanvasEditProductLabel"
    >
      <div className="offcanvas-header createProducts-header">
        <h5 className="offcanvas-title" id="offcanvasEditProductLabel">
          Sửa sản phẩm
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
              value={dataEdit.name}
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
              value={dataEdit.restaurant_id}
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
              value={dataEdit.category}
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
                  checked={dataEdit.featured === "1"}
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
                  checked={dataEdit.featured === "0"}
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
              value={dataEdit.description}
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
                value={dataEdit.price}
                onChange={handleChange}
                className="form-control createProducts-input"
                required
                min="1"
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label"><i className="bi bi-percent"></i> Giảm giá (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={dataEdit.discountPercentage}
                onChange={handleChange}
                className="form-control createProducts-input"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-boxes"></i> Số lượng</label>
            <input
              type="number"
              name="stock"
              value={dataEdit.stock}
              onChange={handleChange}
              className="form-control createProducts-input"
              required
              min="0"
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-image"></i> Ảnh (URL)</label>
            <input
              type="url"
              name="img"
              value={dataEdit.img}
              onChange={handleChange}
              className="form-control createProducts-input"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><i className="bi bi-sort-numeric-down"></i> Vị trí</label>
            <input
              type="number"
              name="position"
              value={dataEdit.position}
              onChange={handleChange}
              className="form-control createProducts-input"
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
                  checked={dataEdit.status === "active"}
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
                  checked={dataEdit.status === "inactive"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Tạm dừng</label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn createProducts-btn">
            <i className="bi bi-check-circle"></i> Sửa sản phẩm
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProducts;
