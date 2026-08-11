import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../../utils/apiFetch';

const RecommendedRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRecommendations = async (pageNum, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await apiFetch(`/api/restaurants/recommend?limit=12&page=${pageNum}`);
      const newData = res.recommendations || [];
      
      if (isLoadMore) {
        setRestaurants(prev => {
          const existingIds = new Set(prev.map(item => item._id));
          const uniqueNewData = newData.filter(item => !existingIds.has(item._id));
          return [...prev, ...uniqueNewData];
        });
      } else {
        setRestaurants(newData);
      }

      if (newData.length < 12) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching recommendations", err);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecommendations(nextPage, true);
  };

  if (loading) return null;
  if (restaurants.length === 0) return null;

  return (
    <div className="gp-foryou-block" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="gp-foryou-block-head">
        <h4>
          <i className="bi bi-heart-fill text-danger"></i> Gợi ý dành cho bạn
        </h4>
      </div>
      
      <div className="gp-product-grid">
        {restaurants.map((res) => {
           const hash = parseInt(res._id?.slice(-4) || "0", 16);
           const rating = Number(res.ratingAverage || ((hash % 10)/10 + 4)).toFixed(1);
           const reviews = hash % 500 + 50;

           return (
             <Link to={`/restaurant/${res.slug || res._id}/products`} className="gp-rest-card" key={res._id}>
                <div className="gp-rest-cover">
                    <img src={res.logo || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=500"} alt={res.name} />
                    <div className="gp-rest-rating">
                        <i className="bi bi-star-fill text-warning"></i> {rating} ({reviews})
                    </div>
                    {res.isOpen === false && (
                        <div className="gp-rest-closed-overlay">Đóng cửa</div>
                    )}
                </div>
                <div className="gp-rest-info">
                    <h5>{res.name}</h5>
                    <p><i className="bi bi-geo-alt-fill"></i> {res.address || "Hệ thống toàn quốc"}</p>
                    <div className="gp-rest-tags">
                        <span>Đặc sản</span>
                        <span>Phổ biến</span>
                    </div>
                </div>
             </Link>
           );
        })}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{ 
              padding: '10px 30px', 
              background: 'transparent', 
              border: '1px solid #c90000', 
              color: '#c90000', 
              borderRadius: '25px', 
              fontSize: '14px', 
              fontWeight: '700', 
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
                if(!loadingMore) { e.target.style.background = '#c90000'; e.target.style.color = '#fff'; }
            }}
            onMouseOut={(e) => {
                if(!loadingMore) { e.target.style.background = 'transparent'; e.target.style.color = '#c90000'; }
            }}
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedRestaurants;
