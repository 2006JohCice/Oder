import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/search-hero.css";

function SearchHero() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch real categories to use as search suggestions
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
            // Pick 3 random categories
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            setSuggestions(shuffled.slice(0, 3).map(c => c.name));
        } else {
            setSuggestions(["Phở", "Lẩu", "Cơm tấm"]);
        }
      })
      .catch(() => setSuggestions(["Trà sữa", "Bánh mì", "Bún bò"]));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (keyword) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <div className="gp-search-container">
      <form className="gp-search-box" onSubmit={handleSubmit}>
        <i className="bi bi-search gp-search-icon" />
        <input
          type="text"
          className="gp-search-input"
          placeholder="Tìm món ngon ngay..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </form>
      <div className="gp-search-suggestions">
        {suggestions.map((sug, i) => (
            <span key={i} onClick={() => {
                setKeyword(sug);
                navigate(`/search?keyword=${encodeURIComponent(sug)}`);
            }}>{sug}</span>
        ))}
      </div>
      
      <div className="gp-quick-filters">
        <button className="gp-filter-chip gp-active" onClick={() => navigate('/search')}>
          <i className="bi bi-cursor-fill" /> Gần bạn
        </button>
        <button className="gp-filter-chip" onClick={() => navigate('/products')}>
          <i className="bi bi-fire" /> Món ngon
        </button>
        <button className="gp-filter-chip" onClick={() => navigate('/restaurants')}>
          <i className="bi bi-shop" /> Nhà hàng
        </button>
      </div>
    </div>
  );
}

export default SearchHero;
