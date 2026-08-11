import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/search-hero.css";
import { apiFetch } from "../../../../utils/apiFetch";

function SearchHero() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isHistory, setIsHistory] = useState(false);

  useEffect(() => {
    // Try to fetch search history if logged in
    const fetchHistory = async () => {
        try {
            const res = await apiFetch("/api/search-history");
            if (Array.isArray(res) && res.length > 0) {
                setSuggestions(res);
                setIsHistory(true);
            } else {
                fetchRandomCategories();
            }
        } catch (error) {
            // Not logged in or error
            fetchRandomCategories();
        }
    };

    const fetchRandomCategories = () => {
        setIsHistory(false);
        fetch("/api/category")
        .then((res) => res.json())
        .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
                const shuffled = [...data].sort(() => 0.5 - Math.random());
                setSuggestions(shuffled.slice(0, 5).map(c => c.name));
            } else {
                setSuggestions(["Phở", "Lẩu", "Cơm tấm"]);
            }
        })
        .catch(() => setSuggestions(["Trà sữa", "Bánh mì", "Bún bò"]));
    };

    fetchHistory();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (keyword.trim()) {
        const formattedKeyword = keyword.trim();
        // push to history async (fire and forget)
        try {
            await apiFetch("/api/search-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword: formattedKeyword })
            });
        } catch (e) {
            // ignore
        }
        navigate(`/search?keyword=${encodeURIComponent(formattedKeyword)}`);
    }
  };

  const handleSuggestionClick = async (sug) => {
      setKeyword(sug);
      try {
          await apiFetch("/api/search-history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ keyword: sug })
          });
      } catch (e) {
          // ignore
      }
      navigate(`/search?keyword=${encodeURIComponent(sug)}`);
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
      <div className="gp-search-suggestions" style={{ alignItems: 'center' }}>
        {isHistory && <span style={{fontSize: '12px', color: '#777', marginRight: '5px', fontWeight: '500'}}>Lịch sử: </span>}
        {suggestions.map((sug, i) => (
            <span key={i} className="gp-sug-chip" onClick={() => handleSuggestionClick(sug)}>{sug}</span>
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
