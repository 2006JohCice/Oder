import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/search-hero.css";

function VerticalAd() {
  const [ad, setAd] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/advertisements")
      .then(res => res.json())
      .then(data => {
        if (data?.ads2?.items?.length > 0) {
            setAd(data.ads2.items[0]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  if (!ad || !ad.image) {
    return (
        <div className="gp-vertical-ad">
          <div className="gp-vad-image">
            <img 
              src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80" 
              alt="Khuyến Mãi Cuối Tuần" 
            />
            <div className="gp-vad-overlay">
                <div className="gp-vad-content">
                    <span className="gp-vad-badge">MỚI</span>
                    <h3>Trà Sữa Thái<br/>Mua 1 Tặng 1</h3>
                    <button className="gp-vad-btn">Mua Ngay</button>
                </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="gp-vertical-ad">
      <div className="gp-vad-image">
        <img 
          src={ad.image} 
          alt={ad.title || "Ad"} 
        />
        <div className="gp-vad-overlay">
            <div className="gp-vad-content">
                {ad.badge && <span className="gp-vad-badge">{ad.badge}</span>}
                {ad.title && <h3 style={{ whiteSpace: 'pre-line' }}>{ad.title.replace(/\\n/g, '\n')}</h3>}
                <button className="gp-vad-btn" onClick={() => ad.link ? navigate(ad.link) : navigate('/products')}>Mua Ngay</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default VerticalAd;
