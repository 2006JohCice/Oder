import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/search-hero.css";

function Advertisement() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/advertisements")
      .then(res => res.json())
      .then(data => {
        if (data?.ads1?.items?.length > 0) {
            setBanners(data.ads1.items);
        } else {
            // fallback
            setBanners([
              {
                id: 1,
                image: "https://vimages.coccoc.com/vimage?ns=recipe&url=https%3A%2F%2Fmonngonmoingay.com%2Fwp-content%2Fuploads%2F2019%2F07%2Fcanh-ngheu-mang-le-vi-lau-thai-500.jpg",
                badge: "CPM CAMPAIGN",
                title: "Tiệc Lẩu Thái \n Giảm Tới 40%",
                desc: "Trải nghiệm hương vị chuẩn Bangkok ngay tại Sài Gòn.",
                link: ""
              }
            ]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="gp-banner-wrapper">
      <div className="gp-banner-card">
        
        {banners.map((banner, index) => (
            <div 
                key={index}
                className={`gp-banner-slide ${index === currentIndex ? 'active' : ''}`}
            >
                <div className="gp-banner-image">
                    <img src={banner.image} alt={banner.title || "Banner"} />
                    <div className="gp-banner-overlay"></div>
                </div>
                
                <div className="gp-banner-content">
                    {banner.badge && <span className="gp-banner-badge">{banner.badge}</span>}
                    {banner.title && <h2 style={{ whiteSpace: 'pre-line' }}>{banner.title.replace(/\\n/g, '\n')}</h2>}
                    {banner.desc && <p>{banner.desc}</p>}
                    <button className="gp-banner-btn" onClick={() => banner.link ? navigate(banner.link) : navigate('/products')}>Khám phá ngay</button>
                </div>
            </div>
        ))}

        {banners.length > 1 && (
            <div className="gp-banner-dots">
                {banners.map((_, index) => (
                    <span 
                        key={index} 
                        className={`gp-dot ${index === currentIndex ? 'gp-active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default Advertisement;
