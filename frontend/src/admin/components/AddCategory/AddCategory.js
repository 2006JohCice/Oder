import { useEffect, useMemo, useState } from "react";
import "../../css/shared/admin-components.css";
import ListCategory from "./list-category";
import ShowCategory from "./show-category";
import { apiFetch } from "../../../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

const CategoryAdmin = () => {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "", description: "", father_id: "", img: "", position: "", status: "active",
  });

  const fetchCategory = () => {
    setLoading(true);
    apiFetch("/api/admin/category")
      .then(res => { setData(res); setLoading(false); })
      .catch(err => { if (err.status === 401) navigate("/admin/auth/login"); });
  };

  useEffect(() => { fetchCategory(); }, []);

  const flatCount = useMemo(() => {
    const walk = (nodes = []) => nodes.reduce((sum, node) => sum + 1 + walk(node.children || []), 0);
    return walk(data);
  }, [data]);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submitCategory = async () => {
    try {
      const res = await fetch("/api/admin/category/create", {
        method: "POST", headers: { "Content-type": "application/json" },
        credentials: "include", body: JSON.stringify(formData),
      });
      const resData = await res.json();
      if (!res.ok) { notifyApp(resData?.message || "Không thể tạo", "error"); return; }
      notifyApp(resData?.message || "Tạo thành công", "success");
      setFormData({ name: "", description: "", father_id: "", img: "", position: "", status: "active" });
      setShowAdd(false);
      fetchCategory();
    } catch (error) { notifyApp("Lỗi khi tạo", "error"); }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-tags" style={{ color: "var(--adm-accent)", marginRight: 8 }} />
            Quản lý danh mục
          </h1>
          <p className="adm-page-sub">Cây danh mục dùng chung cho sản phẩm toàn hệ thống</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <><i className="bi bi-list-ul" /> Hiện danh sách</> : <><i className="bi bi-plus-lg" /> Thêm danh mục</>}
        </button>
      </div>

      <section className="adm-stats">
        <div className="adm-stat-card adm-stat-card--green">
          <div className="adm-stat-icon"><i className="bi bi-tags-fill" /></div>
          <span className="adm-stat-label">Tổng danh mục</span>
          <span className="adm-stat-value">{flatCount}</span>
          <span className="adm-stat-sub">tất cả cấp độ</span>
        </div>
        <div className="adm-stat-card adm-stat-card--blue">
          <div className="adm-stat-icon"><i className="bi bi-folder-symlink" /></div>
          <span className="adm-stat-label">Danh mục gốc</span>
          <span className="adm-stat-value">{data.length}</span>
          <span className="adm-stat-sub">cấp cao nhất</span>
        </div>
      </section>

      {showAdd ? (
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title"><i className="bi bi-plus-circle" /> Tạo danh mục mới</span>
          </div>
          <div className="adm-card-body" style={{ maxWidth: 600 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Tên danh mục</label>
              <input type="text" name="name" className="adm-form-input" placeholder="Nhập tên..." value={formData.name} onChange={handleChange} />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Danh mục cha</label>
              <select name="father_id" className="adm-form-select" value={formData.father_id} onChange={handleChange}>
                <option value="">Chọn danh mục cha (Trống = Gốc)</option>
                {data.map(item => <ListCategory key={item._id} node={item} />)}
              </select>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Mô tả</label>
              <textarea name="description" className="adm-form-textarea" placeholder="Nhập mô tả..." value={formData.description} onChange={handleChange} />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Ảnh (URL)</label>
              <input type="url" name="img" className="adm-form-input" placeholder="Link ảnh..." value={formData.img} onChange={handleChange} />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Vị trí (Thứ tự)</label>
              <input type="number" name="position" className="adm-form-input" value={formData.position} onChange={handleChange} />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Trạng thái</label>
              <select name="status" className="adm-form-select" value={formData.status} onChange={handleChange}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
            <button className="adm-btn adm-btn--save" onClick={submitCategory} style={{ marginTop: 10 }}>
              <i className="bi bi-floppy" /> Lưu danh mục
            </button>
          </div>
        </div>
      ) : (
        <div className="adm-card">
          <div className="adm-toolbar" style={{ border: "none", borderBottom: "1px solid var(--adm-border)", borderRadius: 0, margin: 0 }}>
            <div className="adm-toolbar-left">
              <span style={{ fontWeight: 700, color: "var(--adm-text)" }}><i className="bi bi-list-nested" /> Cây danh mục</span>
            </div>
          </div>
          <div className="adm-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" className="adm-checkbox" /></th>
                  <th style={{ width: 60 }}>STT</th>
                  <th>Danh mục</th>
                  <th style={{ width: 80 }}>Ảnh</th>
                  <th className="adm-th-center">Nổi bật</th>
                  <th className="adm-th-center">Mới</th>
                  <th className="adm-th-center">Hiển thị</th>
                  <th className="adm-th-center">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="adm-loading-row"><td colSpan="8"><div className="adm-spinner" /><div style={{ color: "var(--adm-muted)", fontSize: 13 }}>Đang tải...</div></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="8"><div className="adm-empty"><div className="adm-empty-icon"><i className="bi bi-inbox" /></div><div>Không có danh mục</div></div></td></tr>
                ) : (
                  data.map(item => <ShowCategory key={item._id} node={item} fetchData={fetchCategory} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryAdmin;
