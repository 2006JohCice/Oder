import { useState, useEffect } from "react";
import "../../css/creatProduct/CreateProducts.css";
import ListCategory from "../AddCategory/list-category";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function CreateProducts({ setProducts, setLoading }) {
  const [data, setData] = useState([]);
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
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const dataResponse = await res.json();

      if (!res.ok) {
        notifyApp(dataResponse?.message || "Khong the tao san pham", "error");
        return;
      }

      setLoading?.(true);
      setProducts((prev) => [...prev, dataResponse.product]);
      resetForm();
      notifyApp(dataResponse.message || "Tao san pham thanh cong", "success");
    } catch (error) {
      notifyApp("Co loi khi tao san pham", "error");
    }
  };

  useEffect(() => {
    fetch("/api/admin/products/create")
      .then((res) => res.json())
      .then((res) => setData(Array.isArray(res) ? res : res.data || []))
      .catch(() => setData([]));
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
          Create Product
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
            <label className="form-label">Tieu de</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Nhap tieu de..."
              required
            />
          </div>

          <select
            name="category"
            className="admin-select"
            style={{ width: "100%" }}
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Lua chon danh muc</option>
            {Array.isArray(data) && data.map((item) => <ListCategory key={item._id} node={item} />)}
          </select>

          <div className="mb-3">
            <label className="form-label">Cai dat hien thi</label>
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
                <label className="form-check-label">Noi bat</label>
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
                <label className="form-check-label">Thong thuong</label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Mo ta</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control createProducts-input"
              rows="3"
              placeholder="Nhap mo ta..."
            ></textarea>
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label">Gia</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control createProducts-input"
                placeholder="Gia goc"
                required
                min="1"
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label">Giam gia (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                className="form-control createProducts-input"
                placeholder="Giam gia"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">So luong</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Nhap so luong"
              required
              min="1"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Anh (URL)</label>
            <input
              type="url"
              name="img"
              value={formData.img}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Dan link anh"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Vi tri</label>
            <input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="form-control createProducts-input"
              placeholder="Nhap vi tri hien thi"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Trang thai</label>
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
                <label className="form-check-label">Hoat dong</label>
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
                <label className="form-check-label">Tam dung</label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn createProducts-btn">
            Tao moi
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProducts;
