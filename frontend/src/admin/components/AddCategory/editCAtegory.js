/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import { useEffect, useState } from "react";
import "../../css/AddCategory/AddCategory.css";
import ListCategory from "./list-category";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

const EditCategory = () => {
  const id = window.location.pathname.split("/").pop();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    father_id: "",
    img: "",
    position: "",
    status: "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const editCategory = () => {
    const url = `/api/admin/category/edit/${id}`;
    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((result) => {
        notifyApp(result.message, "success");
      })
      .catch((err) => console.error(err));

    setLoading(true);
  };

  useEffect(() => {
    const loadForm = async () => {
      try {
        const res = await fetch(`/api/admin/category/edit/${id}`);
        const r = await res.json();
        setFormData({
          name: r.name,
          description: r.description,
          father_id: r.father_id,
          img: r.img,
          position: r.position,
          status: r.status,
        });
      } catch (e) {
        // ignore
      }
    };

    const loadTree = async () => {
      try {
        const res = await fetch("/api/admin/category");
        const r = await res.json();
        setData(r);
      } catch (e) {
        // ignore
      }
    };

    loadForm();
    loadTree();
  }, [id]);

  return (
    <div className="ma-wrapper">
      <div className="ma-panel">
        <div className="ma-panel-header">
          <span className="ma-panel-title">Chỉnh sửa danh mục</span>
        </div>
        <div className="ma-panel-body">
          <div className="mb-3">
            <label className="form-label">Tên danh mục</label>
            <input
              type="text"
              name="name"
              className="form-control createProducts-input"
              placeholder="Nhập tên danh mục..."
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Danh mục cha</label>
            <select
              name="father_id"
              className="admin-select"
              style={{ width: "100%" }}
              value={formData.father_id}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục cha</option>
              {data.map((item) => (
                <ListCategory key={item._id} node={item} />
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              name="description"
              className="form-control createProducts-input"
              placeholder="Nhập mô tả..."
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Ảnh (URL)</label>
            <input
              type="url"
              name="img"
              className="form-control createProducts-input"
              placeholder="Dán link ảnh vào đây..."
              value={formData.img}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Vị trí</label>
            <input
              type="number"
              name="position"
              className="form-control createProducts-input"
              placeholder="Nhập vị trí hiển thị"
              value={formData.position}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Trạng thái</label>
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

          <button type="button" className="btn createProducts-btn" onClick={editCategory}>
            Lưu danh mục
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;

