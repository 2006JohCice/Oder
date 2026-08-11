import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import '../../css/LegalPage.css';

export default function LegalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState('');

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await fetch('/api/policies');
        const data = await res.json();
        if (res.ok) {
          setPolicies(data);
          // Set initial active slug if there's one in URL
          const pathSlug = location.pathname.split('/').pop();
          if (pathSlug && pathSlug !== 'legal' && data.some(p => p.slug === pathSlug)) {
            setActiveSlug(pathSlug);
          } else if (data.length > 0) {
            setActiveSlug(data[0].slug);
            navigate(`/legal/${data[0].slug}`, { replace: true });
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải chính sách:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  useEffect(() => {
    const pathSlug = location.pathname.split('/').pop();
    if (pathSlug && pathSlug !== 'legal') {
      setActiveSlug(pathSlug);
    }
  }, [location]);

  const activePolicy = policies.find(p => p.slug === activeSlug);

  return (
    <div className="legal-page-container">
      <div className="container" style={{ padding: '40px 15px' }}>
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 col-md-4 mb-4">
            <div className="legal-sidebar">
              <h4 className="legal-sidebar-title">Pháp lý</h4>
              {loading ? (
                <div className="text-center p-3"><div className="spinner-border spinner-border-sm text-secondary"></div></div>
              ) : policies.length === 0 ? (
                <p style={{padding: '0 15px', color: '#666'}}>Chưa có thông tin</p>
              ) : (
                <ul className="legal-nav">
                  {policies.map(p => (
                    <li key={p.slug}>
                      <Link 
                        to={`/legal/${p.slug}`} 
                        className={`legal-nav-link ${activeSlug === p.slug ? 'active' : ''}`}
                      >
                        <i className={`bi ${p.slug.includes('privacy') ? 'bi-shield-check' : 'bi-file-earmark-text'}`}></i> {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9 col-md-8">
            <div className="legal-content">
              {loading ? (
                <div className="text-center p-5"><div className="spinner-border text-danger"></div></div>
              ) : activePolicy ? (
                <div className="legal-section animation-fade-in">
                  <h1 className="legal-title">{activePolicy.title}</h1>
                  
                  <div 
                    className="legal-body"
                    dangerouslySetInnerHTML={{ __html: activePolicy.content }}
                  ></div>
                </div>
              ) : (
                <div className="text-center p-5 text-muted">
                  <i className="bi bi-file-earmark-x" style={{fontSize: '40px'}}></i>
                  <p className="mt-3">Không tìm thấy nội dung pháp lý</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
