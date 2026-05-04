/* eslint-disable unicode-bom */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [meal, setMeal] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const searchParams = new URLSearchParams();
    if (keyword) searchParams.set("keyword", keyword);
    if (location) searchParams.set("location", location);
    if (price) searchParams.set("price", price);
    if (meal) searchParams.set("meal", meal);

    navigate(`/search${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
  };

  return (
    <section className="search-shell">
      <form className="search-panel" onSubmit={handleSubmit}>
        <div className="search-heading">
          <p className="eyebrow">Tìm Nhanh Món Phù Hợp</p>
          <h1>Thực đơn hấp dẫn, đặt bàn nhanh, xử lý nhanh cho bạn.</h1>
        </div>

        <div className="search-grid">
          <div className="search-field search-field-wide">
            <label htmlFor="search-keyword">Món ăn & tên combo</label>
            <div className="search-input-wrap">
              <i className="bi bi-search" />
              <input
                id="search-keyword"
                type="text"
                placeholder="Ví dụ: lẩu thái, nem rán Hà Nội, combo 4 người"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="search-field">
            <label htmlFor="search-location">Khu vực</label>
            <select id="search-location" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Chọn khu vực</option>
              <option value="Ha Noi">Hà Nội</option>
              <option value="Ho Chi Minh">Hồ Chí Minh</option>
              <option value="Thanh Hoa">Thanh Hóa</option>
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="search-price">Mức giá</label>
            <select id="search-price" value={price} onChange={(e) => setPrice(e.target.value)}>
              <option value="">Chọn mức giá</option>
              <option value="Duoi 100k">Dưới 100k</option>
              <option value="100k - 200k">100k - 200k</option>
              <option value="200k - 300k">200k - 300k</option>
              <option value="300k - 500k">300k - 500k</option>
              <option value="Tren 500k">Trên 500k</option>
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="search-meal">Loại bữa</label>
            <select id="search-meal" value={meal} onChange={(e) => setMeal(e.target.value)}>
              <option value="">Chọn bữa</option>
              <option value="Bua sang">Bữa sáng</option>
              <option value="Bua trua">Bữa trưa</option>
              <option value="Bua toi">Bữa tối</option>
              <option value="Lau">Lẩu</option>
              <option value="Nuong">Nướng</option>
              <option value="Combo">Combo</option>
            </select>
          </div>
        </div>

        <div className="search-actions">
          <button type="submit" className="primary-button">
            Tìm món ăn
          </button>
          <a href="/cart/checkout?mode=table" className="secondary-button no-underline">
            Ưu đãi đặt bàn
          </a>
        </div>
      </form>
    </section>
  );
}

export default Search;
