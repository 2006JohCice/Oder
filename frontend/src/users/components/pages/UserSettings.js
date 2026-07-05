import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/UserSettings.css";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function UserSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) {
          navigate("/user/auth/login");
          return;
        }

        const data = await res.json();
        setFormData({
          fullname: data?.user?.fullname || data?.user?.name || "",
          phone: data?.user?.phone || "",
          avatar: data?.user?.avatar || "",
        });
      } catch (error) {
        notifyApp("Không thể tải thông tin tài khoản", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        notifyApp("Cập nhật thông tin thành công", "success");
      } else {
        notifyApp(data.message || "Cập nhật thất bại", "error");
      }
    } catch (error) {
      notifyApp("Lỗi kết nối máy chủ", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="gp-settings-loader">
            <div className="gp-spinner"></div>
            <p>Đang tải hồ sơ của bạn...</p>
        </div>
    );
  }

  return (
    <div className="gp-settings-wrapper">
        <div className="gp-settings-container">
            
            {/* SIDEBAR */}
            <aside className="gp-settings-sidebar">
                <div className="gp-settings-user">
                    <img src={formData.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="User Avatar" />
                    <div>
                        <h3>{formData.fullname || "Người dùng"}</h3>
                        <p>Thành viên Bạc</p>
                    </div>
                </div>
                <nav className="gp-settings-nav">
                    <button 
                        className={activeTab === 'profile' ? 'active' : ''} 
                        onClick={() => setActiveTab('profile')}
                    >
                        <i className="bi bi-person-circle"></i> Hồ sơ cá nhân
                    </button>
                    <button 
                        className={activeTab === 'security' ? 'active' : ''} 
                        onClick={() => setActiveTab('security')}
                    >
                        <i className="bi bi-shield-lock"></i> Đổi mật khẩu
                    </button>
                    <button 
                        className={activeTab === 'notifications' ? 'active' : ''} 
                        onClick={() => setActiveTab('notifications')}
                    >
                        <i className="bi bi-bell"></i> Thông báo
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="gp-settings-main">
                {activeTab === 'profile' && (
                    <div className="gp-settings-card">
                        <div className="gp-settings-card-header">
                            <h2>Hồ sơ cá nhân</h2>
                            <p>Quản lý thông tin cá nhân và cách hiển thị tài khoản của bạn.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="gp-settings-form">
                            
                            {/* Avatar Upload */}
                            <div className="gp-avatar-upload-box">
                                <div className="gp-avatar-preview">
                                    <img src={formData.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Avatar" />
                                    <label htmlFor="avatar-upload" className="gp-avatar-overlay">
                                        <i className="bi bi-camera-fill"></i>
                                    </label>
                                </div>
                                <div className="gp-avatar-info">
                                    <h4>Ảnh đại diện</h4>
                                    <p>Định dạng JPEG, PNG. Dung lượng tối đa 2MB.</p>
                                    <input 
                                        type="file" 
                                        id="avatar-upload" 
                                        accept="image/*" 
                                        onChange={handleAvatarChange} 
                                        style={{ display: "none" }}
                                    />
                                    <label htmlFor="avatar-upload" className="gp-btn-outline-upload">Tải ảnh lên</label>
                                </div>
                            </div>

                            <hr className="gp-settings-divider" />

                            <div className="gp-input-row-group">
                                <div className="gp-input-group">
                                    <label>Họ và tên</label>
                                    <div className="gp-input-with-icon">
                                        <i className="bi bi-person"></i>
                                        <input 
                                            type="text" 
                                            name="fullname" 
                                            value={formData.fullname} 
                                            onChange={handleChange} 
                                            placeholder="Nhập họ và tên..."
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="gp-input-group">
                                    <label>Số điện thoại</label>
                                    <div className="gp-input-with-icon">
                                        <i className="bi bi-telephone"></i>
                                        <input 
                                            type="tel" 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleChange} 
                                            placeholder="VD: 0987654321"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="gp-settings-actions">
                                <button type="submit" className="gp-btn-save" disabled={saving}>
                                    {saving ? (
                                        <><i className="bi bi-hourglass-split"></i> Đang lưu...</>
                                    ) : (
                                        <><i className="bi bi-check2-circle"></i> Lưu thay đổi</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="gp-settings-card">
                        <div className="gp-settings-card-header">
                            <h2>Đổi mật khẩu</h2>
                            <p>Đảm bảo tài khoản của bạn được bảo mật an toàn.</p>
                        </div>
                        <div className="gp-empty-state">
                            <i className="bi bi-lock"></i>
                            <p>Tính năng đang được phát triển</p>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="gp-settings-card">
                        <div className="gp-settings-card-header">
                            <h2>Cài đặt thông báo</h2>
                            <p>Quản lý email và thông báo đẩy bạn muốn nhận.</p>
                        </div>
                        <div className="gp-empty-state">
                            <i className="bi bi-bell-slash"></i>
                            <p>Tính năng đang được phát triển</p>
                        </div>
                    </div>
                )}
            </main>

        </div>
    </div>
  );
}

export default UserSettings;
