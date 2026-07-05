import { useState, useEffect } from "react";
import "../../../css/search-hero.css";

const BANNERS = [
  {
    id: 1,
    image: "https://vimages.coccoc.com/vimage?ns=recipe&url=https%3A%2F%2Fmonngonmoingay.com%2Fwp-content%2Fuploads%2F2019%2F07%2Fcanh-ngheu-mang-le-vi-lau-thai-500.jpg",
    badge: "CPM CAMPAIGN",
    title: "Tiệc Lẩu Thái \n Giảm Tới 40%",
    desc: "Trải nghiệm hương vị chuẩn Bangkok ngay tại Sài Gòn."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    badge: "HEALTHY CHOICE",
    title: "Tươi Mát Hè Này \n Combo Salad",
    desc: "Nạp đầy năng lượng với các món chay và salad."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
    badge: "FREESHIP",
    title: "Món Ngon Tận Cửa \n Không Lo Phí Ship",
    desc: "Miễn phí giao hàng cho đơn từ 150k."
  }
];

function Advertisement() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="gp-banner-wrapper">
      <div className="gp-banner-card">
        
        {BANNERS.map((banner, index) => (
            <div 
                key={banner.id}
                className={`gp-banner-slide ${index === currentIndex ? 'active' : ''}`}
            >
                <div className="gp-banner-image">
                    <img src={banner.image} alt={banner.title} />
                    <div className="gp-banner-overlay"></div>
                </div>
                
                <div className="gp-banner-content">
                    <span className="gp-banner-badge">{banner.badge}</span>
                    <h2 style={{ whiteSpace: 'pre-line' }}>{banner.title}</h2>
                    <p>{banner.desc}</p>
                    <button className="gp-banner-btn">Khám phá ngay</button>
                </div>
            </div>
        ))}

        <div className="gp-banner-dots">
            {BANNERS.map((_, index) => (
                <span 
                    key={index} 
                    className={`gp-dot ${index === currentIndex ? 'gp-active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                ></span>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Advertisement;
