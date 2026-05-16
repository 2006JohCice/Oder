import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/AddCategory/AddCategory.css";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function RoleCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitFormData = async () => {
    try {
      const res = await fetch("/api/admin/role/create", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyApp(data.message || "Tạo vai trò thất bại", "error");
        return;
      }
      notifyApp(data.message || "Tạo vai trò thành công", "success");
      navigate("/admin/role");
    } catch (error) {
      notifyApp("Lỗi khi tạo vai trò", "error");
    }
  };

  return (
    <div className="products-container">
      <div className="products-right">
        <div className="mb-3">
          <label className="form-label">Tên vai trò</label>
          <input
            type="text"
            name="name"
            className="form-control createProducts-input"
            placeholder="Nhập tên vai trò..."
            value={formData.name}
            onChange={handleChange}
          />
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

        <button type="button" className="btn createProducts-btn" onClick={submitFormData}>
          Tạo mới
        </button>
      </div>
    </div>
  );
}

export default RoleCreate;
