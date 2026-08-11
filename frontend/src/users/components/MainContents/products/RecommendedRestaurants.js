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
    <div className="gp-foryou-container" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
        <i className="bi bi-heart-fill text-danger" style={{ marginRight: '8px' }}></i>
        Gợi ý dành cho bạn
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {restaurants.map((res) => (
          <div key={res._id} style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #edf2f7',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '350px' // Prevent card from becoming too wide when there are few items
          }}>
            <div style={{ height: '160px', position: 'relative' }}>
              <img src={res.logo || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=500"} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 10, left: 10, background: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="bi bi-star-fill text-warning"></i> {Number(res.ratingAverage || 5).toFixed(1)}
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#c90000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="bi bi-heart-fill"></i> {res.likesCount || 0}
              </div>
            </div>
            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#718096', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="bi bi-geo-alt"></i> {res.address || "Hà Nội"}
              </p>
              <div style={{ flex: 1 }}></div>
              <Link to={`/restaurant/${res.slug || res._id}/products`} style={{ 
                display: 'block', 
                textAlign: 'center', 
                background: '#f8fafc', 
                color: '#2d3748', 
                textDecoration: 'none', 
                padding: '10px', 
                borderRadius: '8px', 
                marginTop: '15px', 
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#edf2f7'}
              onMouseOut={(e) => e.target.style.background = '#f8fafc'}
              >
                Ghé thăm
              </Link>
            </div>
          </div>
        ))}
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
