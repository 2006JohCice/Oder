import "../../../css/search-hero.css";

function VerticalAd() {
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

export default VerticalAd;
