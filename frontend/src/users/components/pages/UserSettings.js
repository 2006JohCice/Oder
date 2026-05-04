import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/UserSettings.css";

function UserSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
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
        setMessage("Không thể tải thông tin tài khoản");
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
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Cập nhật thông tin thành công");
      } else {
        setMessage(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      setMessage("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin tài khoản...</div>;
  }

  return (
    <section className="user-settings-page">
      <h2>Cài đặt tài khoản</h2>

      <form className="user-settings-form" onSubmit={handleSubmit}>
        <div className="avatar-block">
          <img src={formData.avatar || "/default-avatar.jpg"} alt="Ảnh đại diện" />
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>

        <label htmlFor="fullname">Họ và tên</label>
        <input id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} required />

        <label htmlFor="phone">Số điện thoại</label>
        <input id="phone" name="phone" value={formData.phone} onChange={handleChange} />

        <button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>

        {message && <p className="settings-message">{message}</p>}
      </form>
    </section>
  );
}

export default UserSettings;
