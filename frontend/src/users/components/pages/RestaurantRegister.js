import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/RestaurantRegister.css";

const emptyTable = { name: "", area: "", capacity: 4, note: "" };

const RestaurantRegister = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    locationLabel: "",
    tables: [{ ...emptyTable }],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else navigate("/user/auth/login");
      })
      .catch(() => navigate("/user/auth/login"));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (index, key, value) => {
    setFormData((prev) => {
      const nextTables = [...prev.tables];
      nextTables[index] = { ...nextTables[index], [key]: value };
      return { ...prev, tables: nextTables };
    });
  };

  const addTable = () => {
    setFormData((prev) => ({ ...prev, tables: [...prev.tables, { ...emptyTable }] }));
  };

  const removeTable = (index) => {
    setFormData((prev) => ({
      ...prev,
      tables: prev.tables.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        tables: formData.tables.filter((t) => t.name.trim()),
      };

      const res = await fetch("/api/restaurants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Đăng ký nhà hàng thành công! Vui lòng chờ admin duyệt quyền.");
        setTimeout(() => navigate("/restaurant/manage"), 1600);
      } else {
        setMessage(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      setMessage("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">Đang kiểm tra đăng nhập...</div>;

  return (
    <div className="restaurant-register">
      <div className="register-form">
        <h2>Đăng ký nhà hàng</h2>

        {message && (
          <div className={`alert ${message.includes("thành công") ? "alert-success" : "alert-danger"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên nhà hàng *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Tên vị trí / địa điểm *</label>
            <input type="text" name="locationLabel" value={formData.locationLabel} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Địa chỉ *</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Ghi chú nhà hàng</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
          </div>

          <div className="form-group">
            <label>Danh sách bàn</label>
            {formData.tables.map((table, index) => (
              <div key={index} style={{ display: "grid", gap: "8px", marginBottom: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
                <input placeholder="Tên bàn (VD: Bàn 1)" value={table.name} onChange={(e) => handleTableChange(index, "name", e.target.value)} />
                <input placeholder="Khu vực bàn (VD: Tầng 1)" value={table.area} onChange={(e) => handleTableChange(index, "area", e.target.value)} />
                <input type="number" min="1" placeholder="Sức chứa" value={table.capacity} onChange={(e) => handleTableChange(index, "capacity", Number(e.target.value))} />
                <input placeholder="Ghi chú bàn" value={table.note} onChange={(e) => handleTableChange(index, "note", e.target.value)} />
                {formData.tables.length > 1 && (
                  <button type="button" className="btn btn-secondary" onClick={() => removeTable(index)}>Xóa bàn</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addTable}>+ Thêm bàn</button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký nhà hàng"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantRegister;
