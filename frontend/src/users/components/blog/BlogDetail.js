import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const res = await apiFetch(`/api/visit/blogs/${slug}`);
      setBlog(res.blog);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blog) {
      document.title = blog.metaTitle || blog.title;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = blog.metaDescription || "";
    }
  }, [blog]);

  if (loading) return <div className="text-center py-5">Đang tải bài viết...</div>;
  if (!blog) return <div className="text-center py-5"><h1>Không tìm thấy bài viết</h1><Link to="/blog">Quay lại danh sách</Link></div>;

  return (
    <div className="gp-container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
              <li className="breadcrumb-item"><Link to="/blog">Tin Tức</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{blog.title}</li>
            </ol>
          </nav>
          
          <h1 className="mb-3" style={{ fontWeight: "800", fontSize: "2.5rem" }}>{blog.title}</h1>
          <div className="d-flex align-items-center mb-4 text-muted pb-3 border-bottom">
            <div className="me-4"><i className="bi bi-person-circle me-2"></i> {blog.author || "Admin"}</div>
            <div className="me-4"><i className="bi bi-calendar-event me-2"></i> {new Date(blog.createdAt).toLocaleDateString("vi-VN")}</div>
            <div><i className="bi bi-eye me-2"></i> {blog.views} lượt xem</div>
          </div>

          {blog.thumbnail && (
            <div className="mb-4 text-center">
              <img src={blog.thumbnail} alt={blog.title} style={{ maxWidth: "100%", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }} />
            </div>
          )}

          <div 
            className="blog-content" 
            style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#333" }}
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />
          
          <div className="mt-5 pt-4 border-top">
            <Link to="/blog" className="btn btn-outline-secondary rounded-pill px-4">
              <i className="bi bi-arrow-left me-2"></i> Trở về danh sách Tin Tức
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
