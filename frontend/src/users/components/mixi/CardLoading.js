import React from 'react';

function CardLoading() {
  // Generate 8 skeleton cards for a realistic loading grid
  const skeletons = Array.from({ length: 8 });

  return (
    <div className="gp-product-grid">
      {skeletons.map((_, index) => (
        <div key={index} className="gp-product-card gp-skeleton-card">
          <div className="gp-skeleton-image gp-pulse"></div>
          <div className="gp-product-info">
            <div className="gp-skeleton-line gp-pulse" style={{ width: '80%', height: '20px', marginBottom: '10px' }}></div>
            <div className="gp-skeleton-line gp-pulse" style={{ width: '60%', height: '14px', marginBottom: '15px' }}></div>
            <div className="gp-product-divider"></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <div className="gp-skeleton-line gp-pulse" style={{ width: '40px', height: '14px' }}></div>
              <div className="gp-skeleton-line gp-pulse" style={{ width: '80px', height: '14px' }}></div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        .gp-skeleton-card {
            border: 1px solid #edf2f7;
            background: #fff;
            pointer-events: none;
        }
        .gp-skeleton-image {
            width: 100%;
            height: 180px;
            background: #e2e8f0;
            border-radius: 16px 16px 0 0;
        }
        .gp-skeleton-line {
            background: #e2e8f0;
            border-radius: 4px;
        }
        .gp-pulse {
            animation: skeleton-pulse 1.5s infinite ease-in-out;
        }
        @keyframes skeleton-pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export default CardLoading;