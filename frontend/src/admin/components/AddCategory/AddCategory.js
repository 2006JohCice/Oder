import { useEffect, useMemo, useState } from "react";
import "../../css/AddCategory/AddCategory.css";
import ListCategory from "./list-category";
import ShowCategory from "./show-category";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import CardLoading from "../mixi/loadingCart";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

const CategoryAdmin = () => {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [data, setData] = useState([]);
  const [loadingCard, setLoadingCard] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    father_id: "",
    img: "",
    position: "",
    status: "active",
  });

  const flatCount = useMemo(() => {
    const walk = (nodes = []) => nodes.reduce((sum, node) => sum + 1 + walk(node.children || []), 0);
    return walk(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const dataCategory = () => {
    apiFetch("/api/admin/category")
      .then((res) => {
        setData(res);
        setLoadingCard(false);
      })
      .catch((err) => {
        if (err.status === 401) {
          navigate("/admin/auth/login");
        }
      });
  };

  const submitCategory = async () => {
    try {
      const res = await fetch("/api/admin/category/create", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();
      if (!res.ok) {
        notifyApp(responseData?.message || "Không thể tạo danh mục", "error");
        return;
      }

      notifyApp(responseData?.message || "Tạo danh mục thành công", "success");
      setFormData({
        name: "",
        description: "",
        father_id: "",
        img: "",
        position: "",
        status: "active",
      });
      setShowAdd(false);
      dataCategory();
    } catch (error) {
      notifyApp("Đã xảy ra lỗi khi tạo danh mục", "error");
    }
  };

  useEffect(() => {
    dataCategory();
  }, []);

  return (
    <>
      <section className="admin-grid admin-grid-4">
        <div className="admin-card">
          <h3>Tổng danh mục</h3>
          <div className="admin-big">{flatCount}</div>
        </div>
        <div className="admin-card">
          <h3>Danh mục gốc</h3>
          <div className="admin-big">{data.length}</div>
        </div>
      </section>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h3>Quản lý danh mục</h3>
            <div className="admin-muted">Quản lý cây danh mục dùng chung cho toàn hệ thống.</div>
          </div>
          <button className="btn-accent" type="button" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? "Hiện danh sách" : "+ Thêm danh mục"}
          </button>
        </div>
      </div>

      {showAdd ? (
        <div className="products-container">
          <div className="products-right">
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

            <button type="button" className="btn createProducts-btn" onClick={submitCategory}>
              Tạo mới
            </button>
          </div>
        </div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Trạng thái</th>
                <th>Vị trí</th>
                <th>Hành động</th>
              </tr>
            </thead>
            {loadingCard ? (
              <tbody>
                <CardLoading />
              </tbody>
            ) : (
              <tbody>
                {data?.map((item, index) => (
                  <ShowCategory key={item._id} node={{ ...item, index }} />
                ))}
              </tbody>
            )}
          </table>
        </div>
      )}
    </>
  );
};

export default CategoryAdmin;
