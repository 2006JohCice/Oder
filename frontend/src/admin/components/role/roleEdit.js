import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetch(`/api/admin/role/edit/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          description: data.description || "",
        });
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitFormData = async () => {
    try {
      const res = await fetch(`/api/admin/role/edit/${id}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyApp(data.message || "Cập nhật vai trò thất bại", "error");
        return;
      }
      notifyApp(data.message || "Cập nhật vai trò thành công", "success");
      navigate("/admin/role");
    } catch (error) {
      notifyApp("Lỗi khi cập nhật vai trò", "error");
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
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

export default RoleEdit;
