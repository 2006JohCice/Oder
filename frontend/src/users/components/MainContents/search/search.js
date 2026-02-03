import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [meal, setMeal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let url = "/search";
    const params = [];

    if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
    if (location) params.push(`location=${encodeURIComponent(location)}`);
    if (price) params.push(`price=${encodeURIComponent(price)}`);
    if (meal) params.push(`meal=${encodeURIComponent(meal)}`);

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    navigate(url);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="search-bar-container" style={{ marginTop: "45px" }}>

        {/* ===== ĐỊA ĐIỂM ===== */}
        <div className="custom-dropdown">
          <div className="dropdown-selected active" data-bs-toggle="dropdown">
            <span className="addrress">{location == "" ? "Lựa Chọn Của Bạn" : location} </span>
            <i className="bi bi-geo-alt">
              <span className="showAddress">{location}</span>
            </i>
          </div>

          <ul className="dropdown-menu">
            {["Hà Nội", "Hồ Chí Minh", "Thanh Hóa"].map(item => (
              <li key={item}>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => setLocation(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== INPUT SEARCH ===== */}
        <div className="search-input-group">
          <button type="submit">
            <span className="search-text">Tìm</span>
            <i className="bi bi-search search-icon"></i>
          </button>

          <input
            type="text"
            name="keyword"
            placeholder="Tìm kiếm theo tên, món ăn..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* ===== GIÁ ===== */}
        <div className="custom-dropdown">
          <div className="dropdown-selected active" data-bs-toggle="dropdown">
            <span className="addrress">{price == "" ? "Lựa Chọn Của Bạn" : price}</span>
            <i className="bi bi-tag">
              <span className="showAddress">
                {price || "Chọn giá"}
              </span>
            </i>
          </div>

          <ul className="dropdown-menu">
            {[
              "Dưới 100k",
              "100k - 200k",
              "200k - 300k",
              "300k - 500k",
              "500k - 1 triệu",
              "Trên 1 triệu"
            ].map(item => (
              <li key={item}>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => setPrice(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== BỮA ĂN ===== */}
        <div className="custom-dropdown">
          <div className="dropdown-selected active" data-bs-toggle="dropdown">
            <span className="addrress"> {meal == "" ? "Lựa Chọn Của Bạn" : meal} </span>
            <i className="bi bi-fork-knife">
              <span className="showAddress">
                {meal || "Chọn bữa ăn"}
              </span>
            </i>
          </div>

          <ul className="dropdown-menu">
            {[
              "Bữa sáng",
              "Bữa trưa",
              "Bữa tối",
              "Bữa khuya",
              "Nướng",
              "Lẩu",
              "Combo",
              "Món khác"
            ].map(item => (
              <li key={item}>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => setMeal(item)}
                  value={meal}
                >

                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </form>
  );
}

export default Search;
