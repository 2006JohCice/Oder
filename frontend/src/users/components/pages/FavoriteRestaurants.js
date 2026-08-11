import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/apiFetch';
import { notifyApp } from '../../../shared/notifications/ToastProvider';

const FavoriteRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiFetch('/api/user/liked-restaurants');
        if (res.likedRestaurants) {
          setRestaurants(res.likedRestaurants);
        }
      } catch (err) {
        if (err.message.includes('Vui lòng đăng nhập')) {
          notifyApp('Vui lòng đăng nhập để xem nhà hàng yêu thích', 'info');
          navigate('/user/auth/login');
        } else {
          console.error("Error fetching favorites", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '70vh' }}>
      <div style={{ marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1a202c', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className="bi bi-heart-fill text-danger"></i> 
          Nhà hàng yêu thích của bạn
        </h1>
        <p style={{ color: '#718096', fontSize: '16px', marginTop: '10px' }}>
          Lưu trữ những địa điểm ẩm thực tuyệt vời mà bạn đã từng trải nghiệm và yêu thích.
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '24px' }}>
          <i className="bi bi-heartbreak" style={{ fontSize: '60px', color: '#cbd5e0' }}></i>
          <h3 style={{ marginTop: '20px', color: '#4a5568', fontWeight: '700' }}>Chưa có nhà hàng yêu thích</h3>
          <p style={{ color: '#718096' }}>Bạn chưa thả tim cho bất kỳ nhà hàng nào. Hãy khám phá và lưu lại nhé!</p>
          <Link to="/restaurants" style={{ display: 'inline-block', marginTop: '15px', background: '#c90000', color: '#fff', padding: '12px 30px', borderRadius: '30px', textDecoration: 'none', fontWeight: '700' }}>
            Khám phá nhà hàng
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
          {restaurants.map((res) => (
            <div key={res._id} style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              border: '1px solid #edf2f7',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
            }}
            >
              <div style={{ height: '180px', position: 'relative' }}>
                <img src={res.logo || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600"} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 15, left: 15, background: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <i className="bi bi-star-fill text-warning"></i> {Number(res.ratingAverage || 5).toFixed(1)}
                </div>
                <div style={{ position: 'absolute', top: 15, right: 15, background: '#fff', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c90000', fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <i className="bi bi-heart-fill"></i>
                </div>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#1a202c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#718096', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="bi bi-geo-alt-fill text-danger"></i> {res.address || "Hà Nội"}
                </p>
                
                <div style={{ flex: 1 }}></div>
                
                <Link to={`/restaurant/${res.slug || res._id}/products`} style={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  background: '#fff', 
                  color: '#c90000', 
                  border: '1px solid #c90000',
                  textDecoration: 'none', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  marginTop: '20px', 
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#c90000';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#c90000';
                }}
                >
                  <i className="bi bi-shop"></i> Ghé thăm ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteRestaurants;
