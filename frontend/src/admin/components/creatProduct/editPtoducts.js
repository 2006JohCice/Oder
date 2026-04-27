import { useState, useEffect } from "react";
import "../../css/creatProduct/CreateProducts.css";
import ListCategory from "../AddCategory/list-category";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function EditProducts({ idEdit, setProducts }) {
  const [data, setData] = useState([]);
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
  });

  useEffect(() => {
    fetch("/api/admin/products/create")
      .then((res) => res.json())
      .then((res) => setData(Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : []))
      .catch(() => setData([]));
  }, []);

  useEffect(() => {
    if (!idEdit) return;
    fetch(`/api/admin/products/edit/${idEdit}`)
      .then((res) => res.json())
      .then((dataResponse) => {
        setDataEdit({
          name: dataResponse.product.name,
          description: dataResponse.product.description,
          price: dataResponse.product.price,
          discountPercentage: dataResponse.product.discountPercentage,
          stock: dataResponse.product.stock,
          img: dataResponse.product.img,
          position: dataResponse.product.position,
          status: dataResponse.product.status,
          category: dataResponse.product.category || "",
          featured: dataResponse.product.featured,
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
        body: JSON.stringify(dataEdit),
      });

      if (!res.ok) {
        notifyApp("Cap nhat san pham that bai", "error");
        return;
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) => (product._id === idEdit ? { ...product, ...dataEdit } : product))
      );
      notifyApp("Cap nhat san pham thanh cong", "success");
    } catch (error) {
      notifyApp("Loi khi cap nhat san pham", "error");
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
          Sua san pham
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
              value={dataEdit.name}
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
            value={dataEdit.category}
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
                  checked={dataEdit.featured === "1"}
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
                  checked={dataEdit.featured === "0"}
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
              value={dataEdit.description}
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
                value={dataEdit.price}
                onChange={handleChange}
                className="form-control createProducts-input"
                required
                min="1"
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label">Giam gia (%)</label>
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
            <label className="form-label">So luong</label>
            <input
              type="number"
              name="stock"
              value={dataEdit.stock}
              onChange={handleChange}
              className="form-control createProducts-input"
              required
              min="1"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Anh (URL)</label>
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
            <label className="form-label">Vi tri</label>
            <input
              type="number"
              name="position"
              value={dataEdit.position}
              onChange={handleChange}
              className="form-control createProducts-input"
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
                  checked={dataEdit.status === "active"}
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
                  checked={dataEdit.status === "inactive"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Tam dung</label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn createProducts-btn">
            Luu thay doi
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProducts;
