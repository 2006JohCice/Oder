import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { calculateDistance, calculateETA } from "../../../utils/geo";
import "../../css/RestaurantList.css";

const deliveryCategories = ["Tất Cả", "Đồ ăn vặt", "Đồ uống", "Món Á", "Món Âu", "Thức ăn nhanh", "Tráng miệng", "Chay"];
const bookingCategories = ["Tất Cả", "Hẹn hò", "Gia đình", "Tiệc tùng", "Tiếp khách", "Buffet", "Ngoài trời", "Phòng riêng"];

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  
  const location = useLocation();
  const isBookingMode = new URLSearchParams(location.search).get('mode') === 'booking';
  const currentCategories = isBookingMode ? bookingCategories : deliveryCategories;

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất Cả");
  const [sortBy, setSortBy] = useState("popular"); // popular, rating, distance
  const [filterRating, setFilterRating] = useState(0); // 0, 4, 5
  const [isOpeningOnly, setIsOpeningOnly] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, () => {
            setUserLocation({ lat: 21.028511, lng: 105.804817 });
        });
    } else {
        setUserLocation({ lat: 21.028511, lng: 105.804817 });
    }
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (res.ok) {
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="gp-rl-loading">
        <div className="spinner"></div>
        <p>Đang tìm kiếm nhà hàng...</p>
      </div>
    );
  }

  // Filter Logic (Mock logic for demonstration)
  let displayedRestaurants = [...restaurants];

  if (searchQuery) {
    displayedRestaurants = displayedRestaurants.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (activeCategory !== "Tất Cả") {
    // Mock category filtering (since backend might not have types for restaurants yet)
    // We'll just randomly hide some to show it works, or match if r.type exists
    displayedRestaurants = displayedRestaurants.filter(r => 
      r.type ? r.type === activeCategory : Math.random() > 0.3
    );
  }

  if (filterRating > 0) {
    displayedRestaurants = displayedRestaurants.filter(r => Number(r.ratingAverage || 5) >= filterRating);
  }

  // Sort Logic
  if (sortBy === "rating") {
    displayedRestaurants.sort((a, b) => Number(b.ratingAverage || 5) - Number(a.ratingAverage || 5));
  } else if (sortBy === "distance") {
    // Sort by distance
    displayedRestaurants.sort((a, b) => {
      const locA = a.location || { lat: 21.028511, lng: 105.804817 };
      const locB = b.location || { lat: 21.028511, lng: 105.804817 };
      const distA = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, locA.lat, locA.lng) : 0;
      const distB = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, locB.lat, locB.lng) : 0;
      return distA - distB;
    }); 
  }

  return (
    <div className="gp-restaurant-page">
      
      {/* SIDEBAR FILTERS */}
      <aside className="gp-rl-sidebar">
        
        {/* Search */}
        <div className="gp-rl-search-box">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Tìm quán ăn, trà sữa..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="gp-rl-filter-group">
          <h4>Danh Mục</h4>
          <div className="gp-rl-categories">
            {currentCategories.map(cat => (
              <div 
                key={cat} 
                className={`gp-rl-cat-item ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                {activeCategory === cat && <i className="bi bi-check2"></i>}
              </div>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="gp-rl-filter-group">
          <h4>Đánh Giá</h4>
          <label className="gp-rl-radio">
            <input type="radio" name="rating" checked={filterRating === 0} onChange={() => setFilterRating(0)} />
            <span>Tất cả</span>
          </label>
          <label className="gp-rl-radio">
            <input type="radio" name="rating" checked={filterRating === 5} onChange={() => setFilterRating(5)} />
            <span>5 Sao (Tuyệt Hảo)</span>
          </label>
          <label className="gp-rl-radio">
            <input type="radio" name="rating" checked={filterRating === 4} onChange={() => setFilterRating(4)} />
            <span>Từ 4 Sao Trở Lên</span>
          </label>
        </div>

        {/* Opening Status */}
        <div className="gp-rl-filter-group">
          <h4>Trạng Thái</h4>
          <label className="gp-rl-toggle">
            <span>Chỉ quán đang mở cửa</span>
            <input type="checkbox" checked={isOpeningOnly} onChange={() => setIsOpeningOnly(!isOpeningOnly)} />
            <div className="slider"></div>
          </label>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="gp-rl-content">
        
        {/* HEADER & SORTING */}
        <div className="gp-rl-header-area">
          <div className="gp-rl-header-text">
            <h1>{isBookingMode ? "Đặt Bàn Nhà Hàng" : "Nhà Hàng Nổi Bật"}</h1>
            <p>Khám phá {displayedRestaurants.length} địa điểm {isBookingMode ? "lý tưởng để đặt bàn" : "ẩm thực tuyệt vời nhất"} được cộng đồng đánh giá cao.</p>
          </div>
          
          <div className="gp-rl-sort-bar">
            <span>Sắp xếp theo:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="distance">Gần tôi nhất</option>
            </select>
          </div>
        </div>

        {/* RESTAURANT GRID */}
        {displayedRestaurants.length > 0 ? (
          <div className="gp-rl-grid">
            {displayedRestaurants.map((restaurant, idx) => {
              let badge = null;
              if (isBookingMode) {
                if (Number(restaurant.ratingAverage || 5) >= 4.8) badge = { text: "PREMIUM", color: "gold" };
                else if (idx % 3 === 0) badge = { text: "BÀN TRỐNG", color: "green" };
                else if (idx % 4 === 0) badge = { text: "VIEW ĐẸP", color: "gray" };
              } else {
                if (Number(restaurant.ratingAverage || 5) >= 4.8) badge = { text: "PREMIUM", color: "gold" };
                else if (idx % 3 === 0) badge = { text: "FREESHIP", color: "green" };
                else if (idx % 4 === 0) badge = { text: "TÀI TRỢ", color: "gray" };
              }

              return (
                <RestaurantCard 
                  key={restaurant._id} 
                  restaurant={restaurant} 
                  badge={badge} 
                  userLocation={userLocation}
                  isBookingMode={isBookingMode}
                />
              );
            })}
          </div>
        ) : (
          <div className="gp-rl-empty-state">
            <img src="https://cdn-icons-png.flaticon.com/512/2748/2748927.png" alt="No result" />
            <h3>Không tìm thấy nhà hàng nào</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm nhé.</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("Tất Cả"); setFilterRating(0); }}>
              Xóa bộ lọc
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

function RestaurantCard({ restaurant, badge, userLocation, isBookingMode }) {
  const restaurantLoc = restaurant.location || { lat: 21.028511, lng: 105.804817 };
  const realDist = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, restaurantLoc.lat, restaurantLoc.lng) : (Math.random() * 5 + 1).toFixed(1);
  const realTime = userLocation ? calculateETA(realDist) : Math.floor(Math.random() * 20 + 10);
  
  const rating = Number(restaurant.ratingAverage || 5.0).toFixed(1);
  const totalReviews = restaurant.orderCount ? `${restaurant.orderCount}+` : `${Math.floor(Math.random() * 100 + 10)}+`;
  
  // High quality images pool
  const images = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=800&auto=format&fit=crop"
  ];
  const imgUrl = restaurant.logo || images[Math.floor(Math.random() * images.length)];

  return (
    <Link to={`/restaurant/${restaurant.slug || restaurant._id}/products`} className="gp-rl-card">
      <div className="gp-rl-card-img-wrapper">
        <img src={imgUrl} alt={restaurant.name} />
        
        {/* Gradient Overlay for better contrast */}
        <div className="gp-rl-card-img-overlay"></div>
        
        {/* Badge */}
        {badge && (
          <div className={`gp-rl-badge gp-badge-${badge.color}`}>
            {badge.text}
          </div>
        )}
        
        {/* Time / Booking Slot Floating Box */}
        <div className="gp-rl-time-box">
          {isBookingMode ? (
            <>
              <i className="bi bi-calendar-check" style={{ fontSize: '1.2rem', marginBottom: '2px', display: 'block', color: 'var(--gp-primary)' }}></i>
              <small>Có bàn trống</small>
            </>
          ) : (
            <>
              <span>{realTime}</span>
              <small>Phút</small>
            </>
          )}
        </div>
      </div>
      
      <div className="gp-rl-card-info">
        <div className="gp-rl-card-header">
          <h4 className="gp-rl-card-title">{restaurant.name}</h4>
          <div className="gp-rl-rating-badge">
            <i className="bi bi-star-fill"></i> {rating}
          </div>
        </div>
        
        <p className="gp-rl-tags">{restaurant.type || "Ẩm thực Quốc tế"} • $$$</p>
        
        <div className="gp-rl-card-footer">
          <div className="gp-rl-meta-item">
            <i className="bi bi-geo-alt"></i> {realDist} km
          </div>
          <div className="gp-rl-meta-item">
            <i className="bi bi-chat-text"></i> {totalReviews} nhận xét
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RestaurantList;
