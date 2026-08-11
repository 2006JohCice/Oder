import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { prefixAdmin } from "../../../config/system";
import { apiFetch } from "../../../utils/apiFetch";
import { Editor } from "@tinymce/tinymce-react";
import LoadingSpinner from "../shared/LoadingSpinner";
import "../../css/SeoForm.css"; // Use new premium styles

export default function SeoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    thumbnail: "",
    isAdvertisement: false,
    adImage: "",
    status: "draft"
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await apiFetch(`/api/admin/seo/${id}`);
      setFormData(res.post);
    } catch (err) {
      alert("Không tìm thấy bài viết");
      navigate(`${prefixAdmin}admin/seo`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const content = editorRef.current ? editorRef.current.getContent() : formData.content;
    const payload = { ...formData, content };

    try {
      let res;
      if (isEdit) {
        res = await apiFetch(`/api/admin/seo/edit/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch(`/api/admin/seo/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.post) {
        alert(isEdit ? "Cập nhật thành công" : "Tạo mới thành công");
        navigate(`${prefixAdmin}admin/seo`);
      } else {
        alert(res.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="seo-form-container">
      <div className="seo-page-header">
        <h2 className="seo-page-title">
          {isEdit ? (
            <><i className="bi bi-pencil-square"></i> Chỉnh Sửa Bài Viết</>
          ) : (
            <><i className="bi bi-plus-square"></i> Thêm Bài Viết Mới</>
          )}
        </h2>
        <Link to={`${prefixAdmin}admin/seo`} className="seo-btn-back">
          <i className="bi bi-arrow-left"></i> Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="seo-grid">
        
        {/* LEFT COLUMN - 70% */}
        <div className="seo-col-main">
          
          <div className="seo-card">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Nhập tiêu đề ấn tượng..."
              className="seo-input-title"
            />

            <div className="seo-slug-wrapper">
                <span>Slug:</span>
                <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="bai-viet-mau-123"
                    className="seo-slug-input"
                />
                <button type="button" onClick={generateSlug} className="seo-btn-slug">
                   Tạo tự động
                </button>
            </div>
          </div>

          <div className="seo-card editor-card">
            <Editor
              apiKey="0tco57klvip65a8n1b7epf1bguqh7jkxq7q2mt557wdtgeum"
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={formData.content}
              init={{
                height: 600,
                menubar: true,
                plugins: [
                  "advlist autolink lists link image charmap preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media table code help wordcount",
                  "image"
                ],
                toolbar:
                  "undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor | fullscreen preview",
                content_style: "body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px; }"
              }}
            />
          </div>

        </div>

        {/* RIGHT COLUMN - 30% */}
        <div className="seo-col-side">
          
          {/* Publish Panel */}
          <div className="seo-card">
            <h3 className="seo-card-title"><i className="bi bi-send"></i> Xuất Bản</h3>
            
            <div className="seo-form-group">
                <label className="seo-label">Trạng thái:</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="seo-select"
                >
                    <option value="draft">Bản nháp (Draft)</option>
                    <option value="published">Xuất bản (Published)</option>
                </select>
            </div>

            <button type="submit" disabled={saving} className="seo-btn-submit">
              {saving ? (
                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...</>
              ) : (
                <><i className="bi bi-save"></i> {isEdit ? "Cập Nhật" : "Đăng Bài"}</>
              )}
            </button>
          </div>

          {/* Advertisement Panel */}
          <div className="seo-card">
            <h3 className="seo-card-title"><i className="bi bi-badge-ad"></i> Dành cho Quảng cáo</h3>
            
            <div className="seo-form-group" style={{ marginBottom: formData.isAdvertisement ? '15px' : 0 }}>
                <label className="seo-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input
                        type="checkbox"
                        name="isAdvertisement"
                        checked={formData.isAdvertisement}
                        onChange={handleChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    Kích hoạt Bài viết Quảng cáo
                </label>
            </div>

            {formData.isAdvertisement && (
              <>
                <div className="seo-form-group" style={{ marginBottom: 0 }}>
                    <label className="seo-label">Link Ảnh Quảng Cáo (Dọc)</label>
                    <input
                        type="text"
                        name="adImage"
                        value={formData.adImage}
                        onChange={handleChange}
                        placeholder="Dán link ảnh quảng cáo dọc (400x800)..."
                        className="seo-input"
                    />
                </div>
                {formData.adImage && (
                  <div style={{ marginTop: '15px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={formData.adImage} alt="Ad Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Thumbnail Panel */}
          <div className="seo-card">
            <h3 className="seo-card-title"><i className="bi bi-image"></i> Ảnh đại diện (Link)</h3>
            
            <div className="seo-form-group" style={{ marginBottom: 0 }}>
                <label className="seo-label">Link Ảnh / URL</label>
                <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="Dán link ảnh vào đây (https://...)"
                    className="seo-input"
                />
            </div>
            {formData.thumbnail && (
              <div style={{ marginTop: '15px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={formData.thumbnail} alt="Thumbnail Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}
          </div>

          {/* Meta Data Panel */}
          <div className="seo-card">
            <h3 className="seo-card-title"><i className="bi bi-search"></i> Tối ưu SEO</h3>
            
            <div className="seo-form-group">
                <label className="seo-label">Meta Title</label>
                <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="Tiêu đề hiển thị trên Google..."
                    className="seo-input"
                />
            </div>

            <div className="seo-form-group">
                <label className="seo-label">Meta Description</label>
                <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn thu hút..."
                    rows="3"
                    className="seo-textarea"
                />
            </div>

            <div className="seo-form-group" style={{ marginBottom: 0 }}>
                <label className="seo-label">Keywords</label>
                <input
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleChange}
                    placeholder="Ví dụ: nhà hàng, món ngon..."
                    className="seo-input"
                />
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
