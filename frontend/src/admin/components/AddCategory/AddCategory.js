/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import { useEffect, useState } from "react";
import "../../css/AddCategory/AddCategory.css";
import ListCategory from "./list-category";
import ShowCategory from "./show-category";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import CardLoading from "../mixi/loadingCart";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

const ProductsAdmin = () => {
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
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();
      if (!res.ok) {
        notifyApp(responseData?.message || "Khong the tao danh muc", "error");
        return;
      }

      notifyApp(responseData?.message || "Tao danh muc thanh cong", "success");
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
      notifyApp("Da xay ra loi khi tao danh muc", "error");
    }
  };

  useEffect(() => {
    dataCategory();
  }, []);

  return (
    <>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button className="btn-accent" type="button" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Hien danh muc" : "+ Them danh muc"}
        </button>
      </div>

      {showAdd ? (
        <div className="products-container">
          <div className="products-right">
            <div className="mb-3">
              <label className="form-label">Tieu de</label>
              <input
                type="text"
                name="name"
                className="form-control createProducts-input"
                placeholder="Nhap tieu de..."
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <select
                name="father_id"
                className="admin-select"
                style={{ width: "100%" }}
                value={formData.father_id}
                onChange={handleChange}
              >
                <option value="">Lua chon danh muc cha</option>
                {data.map((item) => (
                  <ListCategory key={item._id} node={item} />
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Mo ta</label>
              <textarea
                name="description"
                className="form-control createProducts-input"
                placeholder="Nhap mo ta..."
                rows="3"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Anh (URL)</label>
              <input
                type="url"
                name="img"
                className="form-control createProducts-input"
                placeholder="Dan link anh vao day..."
                value={formData.img}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Vi tri</label>
              <input
                type="number"
                name="position"
                className="form-control createProducts-input"
                placeholder="Nhap vi tri hien thi"
                value={formData.position}
                onChange={handleChange}
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

            <button type="button" className="btn createProducts-btn" onClick={submitCategory}>
              Tao moi
            </button>
          </div>
        </div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Anh</th>
                <th>Ten</th>
                <th>Trang thai</th>
                <th>Vi tri</th>
                <th>Hanh dong</th>
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

export default ProductsAdmin;
