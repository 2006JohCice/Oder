/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import { useEffect, useState } from "react";
import "../../css/AddCategory/AddCategory.css";
import ListCategory from "./list-category"
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import { Link } from "react-router-dom";
const EditCategory = () => {
  const id = window.location.pathname.split("/").pop();
  const [data, setData] = useState([])
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }


  const editCategory = () => {
    let url = `/api/admin/category/edit/${id}`;
    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),

    })
      .then(res => res.json())
      .then(result => {
        notifyApp(result.message, "success");
      })
      .catch(err => console.error(err));

      setLoading(true);
  }

  useEffect(() => {
    let url = `/api/admin/category/edit/${id}`;
    fetch(url)
      .then(res => res.json())
      .then(res => {
        setFormData({
          name: res.name,
          description: res.description,
          father_id: res.father_id,
          img: res.img,
          position: res.position,
          status: res.status,
        });
      })

    // LÃ¡ÂºÂ¥y cÃƒÂ¢y danh mÃ¡Â»Â¥c cha
    fetch("/api/admin/category")
      .then(res => res.json())
      .then(res => setData(res)) // res lÃƒÂ  mÃ¡ÂºÂ£ng cÃƒÂ¢y danh mÃ¡Â»Â¥c
      .catch((err) => console.error("LÃ¡Â»â€”i khi lÃ¡ÂºÂ¥y cÃƒÂ¢y danh mÃ¡Â»Â¥c:", err));
  }, [id]);

  return (


    <div className="products-container">
      <div className="products-right">

        <div className="mb-3">
          <label className="form-label">TiÃƒÂªu Ã„â€˜Ã¡Â»Â</label>
          <input
            type="text"
            name="name"
            className="form-control createProducts-input"
            placeholder="NhÃ¡ÂºÂ­p tiÃƒÂªu Ã„â€˜Ã¡Â»Â..."
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">

          <select
            name="father_id"
            className="admin-select"
            style={{ width: "500px" }}
            value={formData.father_id}
            onChange={handleChange}
          >
            <option value="">LÃ¡Â»Â±a chÃ¡Â»Ân cÃ¡Â»Â§a bÃ¡ÂºÂ¡n</option>
            {data.map((item) => (
              <ListCategory key={item._id} node={item} />
            ))}
          </select>

        </div>

        <div className="mb-3">
          <label className="form-label">MÃƒÂ´ tÃ¡ÂºÂ£</label>
          <textarea
            name="description"
            className="form-control createProducts-input"
            placeholder="NhÃ¡ÂºÂ­p mÃƒÂ´ tÃ¡ÂºÂ£..."
            rows="3"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Ã¡ÂºÂ¢nh (URL)</label>
          <input
            type="url"
            name="img"
            className="form-control createProducts-input"
            placeholder="DÃƒÂ¡n link Ã¡ÂºÂ£nh vÃƒÂ o Ã„â€˜ÃƒÂ¢y..."
            value={formData.img}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">VÃ¡Â»â€¹ trÃƒÂ­</label>
          <input
            type="number"
            name="position"
            className="form-control createProducts-input"
            placeholder="NhÃ¡ÂºÂ­p vÃ¡Â»â€¹ trÃƒÂ­ hiÃ¡Â»Æ’n thÃ¡Â»â€¹"
            value={formData.position}
            onChange={handleChange}
          />
        </div>

        {/* TrÃ¡ÂºÂ¡ng thÃƒÂ¡i */}
        <div className="mb-3">
          <label className="form-label">TrÃ¡ÂºÂ¡ng thÃƒÂ¡i</label>
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
              <label className="form-check-label">HoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng</label>
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
                DÃ¡Â»Â«ng hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng
              </label>
            </div>
          </div>
        </div>

        {/* <Link to={`/admin/addCategory`}> */}
          <button
            type="button"
            className="btn createProducts-btn"
            onClick={editCategory}
          >
            LÃ†Â°u danh mÃ¡Â»Â¥c
          </button>
        {/* </Link> */}
      </div>
    </div>

  );

};

export default EditCategory;
