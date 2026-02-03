import { useEffect, useState } from "react";
import "../../css/AddCategory/AddCategory.css";
import ListCategory from "./list-category"
import ShowCategory from "./show-category"
import { apiFetch } from '../../../utils/apiFetch';
import { useNavigate } from "react-router-dom";
import CardLoading from "../mixi/loadingCart";

const ProductsAdmin = () => {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false)
  const [data, setData] = useState([])
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  // console.log(formData)
  const submitCategory = async () => {

    let url = "/api/admin/category/create";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json();

      if (res.ok) {

        setFormData({
          name: "",
          description: "",
          price: "",
          discountPercentage: "",
          stock: "",
          img: "",
          position: "",
          status: "active",
          category: ""
        });
      } else {
        alert("Đã xảy ra lỗi khi tạo sản phẩm.");
      }

    } catch (error) {
      console.error("Error:", error);
    }
  }

  const dataCategory = () => {
    let url = "/api/admin/category"

    apiFetch(url)
      // .then(res => res.json())
      .then(res => {
        setData(res)
        setLoadingCard(false)

  })
      .catch(err => {
        if (err.status === 401) {
          navigate('/admin/auth/login');
        }
        // if (err.status === 200) {
        //   navigate('/admin');
        // }
      });
  }

  useEffect(() => {
    dataCategory();
  }, [])



  // console.log("data", data);
  return (
    <>
      <div div style={{ display: "flex", gap: "10px" }}>

        <button className="btn-accent" type="button" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? `Hiện Danh Mục` : "+ Thêm Danh Mục"}
        </button>

      </div>

      {showAdd ? (
        <div className="products-container">
          <div className="products-right">

            <div className="mb-3">
              <label className="form-label">Tiêu đề</label>
              <input
                type="text"
                name="name"
                className="form-control createProducts-input"
                placeholder="Nhập tiêu đề..."
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              {/* <label className="form-label">Danh Mục Cha</label>
            <input
              type="text"
              name="father_id"
              className="form-control createProducts-input"
              placeholder="Nhập ID danh mục cha..."
              value={formData.father_id}
              onChange={handleChange}
            /> */}
              <select
                name="father_id"
                className="admin-select"
                style={{ width: "500px" }}
                value={formData.father_id}
                onChange={handleChange}
              >
                <option value="">Lựa chọn của bạn</option>
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

            {/* Trạng thái */}
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
                  <label className="form-check-label">
                    Dừng hoạt động
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn createProducts-btn"
              onClick={submitCategory}
            >
              Tạo mới
            </button>
          </div>
        </div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th><input
                  type="checkbox"
                  name="checkall"
                // onChange={handleCheckAll}
                // checked={selectedIds.length === products.length}
                /></th>

                <th>ID</th>
                <th>Ảnh</th>
                <th>Tên</th>

                {/* <th>Danh Mục Cha</th> */}
                <th>Trạng Thái</th>
                <th>Vị Trí</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            {loadingCard ? (
              <tbody>

                < CardLoading />
              </tbody>
            ) : (
            <tbody>
              {data?.map((item) => (
                <ShowCategory key={item._id} node={item} />
              ))}
            </tbody>
            )

            }
         

          </table>
        </div>
      )}
    </>
  );

};

export default ProductsAdmin;
