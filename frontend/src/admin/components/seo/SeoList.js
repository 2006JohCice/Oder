import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { prefixAdmin } from "../../../config/system";
import { apiFetch } from "../../../utils/apiFetch";

export default function SeoList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await apiFetch("/api/admin/seo");
      setPosts(res.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await apiFetch(`/api/admin/seo/delete/${id}`, { method: "DELETE" });
        setPosts(posts.filter(p => p._id !== id));
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-page-content" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="adm-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
          <div style={{ color: '#64748B', fontSize: '15px', fontWeight: 500 }}>Đang tải dữ liệu SEO & Blog...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-content" style={{ background: '#f8fafc', padding: '24px', minHeight: '100vh' }}>
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '16px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* PREMIUM HEADER */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1ABB9C 0%, #2E86C1 100%)', 
          padding: '24px 30px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
              Quản lý SEO & Blog
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
              Quản lý nội dung và tối ưu hóa công cụ tìm kiếm
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link 
              to={`${prefixAdmin}admin/seo/create`} 
              style={{
                background: '#ffffff',
                color: '#1ABB9C',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; }}
            >
              <i className="bi bi-plus-lg" style={{ strokeWidth: '1px' }}></i> Thêm Bài Mới
            </Link>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div style={{ padding: '0' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 0 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', width: '80px', color: '#475569', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Ảnh</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Tiêu đề</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Đường dẫn (Slug)</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Trạng thái</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Lượt xem</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Ngày tạo</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: 600, textAlign: 'right', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
              <tr key={post._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <img 
                    src={post.thumbnail || "https://ui-avatars.com/api/?name=SEO&background=f1f5f9&color=64748B"} 
                    alt={post.title} 
                    style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                  />
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>{post.title}</strong>
                  {post.isAdvertisement && (
                    <span style={{ 
                      marginLeft: '8px', 
                      backgroundColor: '#dc2626', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.7rem', 
                      fontWeight: 600,
                      verticalAlign: 'middle'
                    }}>Quảng cáo</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '0.9rem' }}>{post.slug}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    backgroundColor: post.status === 'published' ? '#dcfce7' : '#f1f5f9',
                    color: post.status === 'published' ? '#166534' : '#475569'
                  }}>
                    {post.status === 'published' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center', color: '#475569', fontWeight: 500 }}>{post.views || 0}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center', color: '#64748B' }}>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <Link 
                    to={`${prefixAdmin}admin/seo/edit/${post._id}`} 
                    className="adm-btn adm-btn-warning adm-btn-sm" 
                    style={{ marginRight: 8, padding: '6px 12px', borderRadius: '6px', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <i className="bi bi-pencil-square" style={{ marginRight: '4px' }}></i> Sửa
                  </Link>
                  <button 
                    onClick={() => handleDelete(post._id)} 
                    className="adm-btn adm-btn-danger adm-btn-sm"
                    style={{ padding: '6px 12px', borderRadius: '6px', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <i className="bi bi-trash" style={{ marginRight: '4px' }}></i> Xóa
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '3rem', marginBottom: '16px' }}><i className="bi bi-inbox"></i></div>
                  <h3 style={{ color: '#475569', margin: '0 0 8px 0' }}>Chưa có bài viết nào</h3>
                  <p style={{ color: '#94a3b8', margin: 0 }}>Hãy nhấn nút "Thêm Bài Mới" để tạo bài viết đầu tiên.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}
