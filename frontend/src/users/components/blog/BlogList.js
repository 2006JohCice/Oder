import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import "../../css/BlogList.css"; 
export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await apiFetch("/api/visit/blogs");
      setBlogs(res.blogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải bài viết...</div>;

  const mainBlogs = blogs.filter(b => !b.isAdvertisement);
  const adBlogs = blogs.filter(b => b.isAdvertisement);

  const topStory = mainBlogs.length > 0 ? mainBlogs[0] : null;
  const subStories = mainBlogs.length > 1 ? mainBlogs.slice(1) : [];

  return (
    <div className="gp-news-page-wrapper">
      <div className="gp-news-container">
        
        <div className="gp-news-header">
          <h2>Tin Tức <span style={{ color: '#c90000' }}>&</span> Blog</h2>
          <div className="gp-news-divider"></div>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">Hiện tại chưa có bài viết nào.</h5>
          </div>
        ) : (
          <div className="gp-news-layout">
            
            {/* MAIN COLUMN: 70% */}
            <div className="gp-news-main">
              {/* TOP STORY */}
              {topStory && (
                <div className="gp-news-top-story">
                  <Link to={`/blog/${topStory.slug}`} className="gp-news-link">
                    <div className="gp-news-img-large">
                      {topStory.thumbnail ? (
                        <img src={topStory.thumbnail} alt={topStory.title} />
                      ) : (
                        <div className="gp-news-placeholder"><i className="bi bi-newspaper"></i></div>
                      )}
                    </div>
                    <div className="gp-news-top-content">
                      <h1 className="gp-news-top-title">{topStory.title}</h1>
                      <div className="gp-news-meta">
                        <span>{new Date(topStory.createdAt).toLocaleDateString("vi-VN")}</span> • <span>{topStory.views} lượt xem</span>
                      </div>
                      <p className="gp-news-top-desc">
                        {topStory.metaDescription || "Đọc bài viết chi tiết để cập nhật thêm thông tin hấp dẫn."}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* SUB STORIES GRID */}
              {subStories.length > 0 && (
                <div className="gp-news-sub-grid">
                  {subStories.map(blog => (
                    <div className="gp-news-sub-story" key={blog._id}>
                      <Link to={`/blog/${blog.slug}`} className="gp-news-link">
                        <div className="gp-news-img-medium">
                          {blog.thumbnail ? (
                            <img src={blog.thumbnail} alt={blog.title} />
                          ) : (
                            <div className="gp-news-placeholder"><i className="bi bi-newspaper"></i></div>
                          )}
                        </div>
                        <h2 className="gp-news-sub-title">{blog.title}</h2>
                        <div className="gp-news-meta">
                          <span>{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <p className="gp-news-sub-desc">
                          {blog.metaDescription || "Mời bạn xem chi tiết."}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SIDEBAR COLUMN: 30% */}
            <div className="gp-news-sidebar">
              <div className="gp-news-sidebar-title">Sản phẩm được quảng cáo</div>
              <div className="gp-news-sidebar-ads">
                {adBlogs.map((blog) => (
                  <div className="gp-news-side-item" key={blog._id} style={{ marginBottom: '25px' }}>
                    <Link to={`/blog/${blog.slug}`} className="gp-news-link" style={{ display: 'block' }}>
                      <div className="gp-news-img-medium" style={{ height: '250px', marginBottom: '10px' }}>
                        {blog.adImage || blog.thumbnail ? (
                          <img src={blog.adImage || blog.thumbnail} alt={blog.title} />
                        ) : (
                          <div className="gp-news-placeholder"><i className="bi bi-megaphone"></i></div>
                        )}
                      </div>
                      <h3 className="gp-news-side-title" style={{ fontSize: '1.1rem' }}>{blog.title}</h3>
                      <div className="gp-news-meta mt-1">
                        <span style={{ 
                          backgroundColor: '#dc2626', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold', 
                          marginRight: '8px' 
                        }}>
                          AD
                        </span>
                        <span>{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </Link>
                  </div>
                ))}
                
                {adBlogs.length === 0 && (
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>Hiện chưa có bài viết quảng cáo nào.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
