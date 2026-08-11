import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import MyEditor from "../tinyMCE/MyEditor";
import "./LegalManagement.css";

export default function LegalManagement() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isActive: true,
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/admin/policies");
      setPolicies(res || []);
    } catch (error) {
      alert("Lỗi khi tải danh sách pháp lý");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleOpenModal = (policy = null) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        title: policy.title,
        slug: policy.slug,
        content: policy.content,
        isActive: policy.isActive,
      });
    } else {
      setEditingPolicy(null);
      setFormData({ title: "", slug: "", content: "", isActive: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      return alert("Vui lòng nhập tiêu đề và đường dẫn (slug)!");
    }
    try {
      if (editingPolicy) {
        await apiFetch(`/api/admin/policies/${editingPolicy._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        alert("Cập nhật thành công!");
      } else {
        await apiFetch("/api/admin/policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        alert("Thêm mới thành công!");
      }
      handleCloseModal();
      fetchPolicies();
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chính sách này?")) {
      try {
        await apiFetch(`/api/admin/policies/${id}`, { method: "DELETE" });
        alert("Xóa thành công!");
        fetchPolicies();
      } catch (error) {
        alert("Lỗi khi xóa");
      }
    }
  };

  return (
    <div className="ma-container">
      <div className="ma-header">
        <div className="ma-header-title">
          <h2>Quản Lý Pháp Lý (Legal & Policies)</h2>
        </div>
        <div className="ma-header-actions">
          <button className="ma-btn-primary" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-circle"></i> Thêm Chính Sách Mới
          </button>
        </div>
      </div>

      <div className="ma-card">
        <div className="ma-card-body">
          {loading ? (
            <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tiêu đề</th>
                    <th>Slug (Đường dẫn)</th>
                    <th>Trạng thái</th>
                    <th>Ngày cập nhật</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((p, index) => (
                    <tr key={p._id}>
                      <td>{index + 1}</td>
                      <td><strong>{p.title}</strong></td>
                      <td><code>/legal/{p.slug}</code></td>
                      <td>
                        <span className={`ma-badge ${p.isActive ? "ma-badge-success" : "ma-badge-warning"}`}>
                          {p.isActive ? "Hiển thị" : "Đang ẩn"}
                        </span>
                      </td>
                      <td>{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button className="ma-btn-icon text-primary" onClick={() => handleOpenModal(p)}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="ma-btn-icon text-danger" onClick={() => handleDelete(p._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {policies.length === 0 && (
                    <tr><td colSpan="6" className="text-center">Chưa có trang pháp lý nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="lm-modal-overlay">
          <div className="lm-modal-content">
            <div className="lm-modal-header">
              <h3>{editingPolicy ? "Sửa Chính Sách" : "Thêm Chính Sách"}</h3>
              <button className="lm-close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="lm-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="lm-form-group">
                  <label>Tiêu đề trang</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="VD: Điều khoản dịch vụ"
                    required
                    className="lm-input"
                  />
                </div>
                
                <div className="lm-form-group">
                  <label>Đường dẫn (Slug)</label>
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} 
                    placeholder="VD: terms, privacy, policy"
                    required
                    className="lm-input"
                  />
                  <small className="lm-help-text">Slug sẽ tạo thành đường dẫn: /legal/slug (Viết liền không dấu)</small>
                </div>

                <div className="lm-form-group">
                  <label>Nội dung</label>
                  <div className="lm-editor-wrapper">
                    <MyEditor 
                      value={formData.content} 
                      onEditorChange={(content) => setFormData({...formData, content})} 
                    />
                  </div>
                </div>

                <div className="lm-form-group lm-switch-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <span style={{marginLeft: '10px'}}>Hiển thị trang này</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="lm-modal-footer">
              <button className="lm-btn-secondary" onClick={handleCloseModal}>Đóng</button>
              <button className="lm-btn-primary" onClick={handleSubmit}>{editingPolicy ? "Cập nhật" : "Lưu"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
