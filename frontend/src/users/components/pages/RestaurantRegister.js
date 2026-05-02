import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/RestaurantRegister.css";

const RestaurantRegister = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    tableCount: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Kiểm tra đăng nhập
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          navigate("/user/auth/login");
        }
      })
      .catch(() => navigate("/user/auth/login"));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/restaurants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Đăng ký nhà hàng thành công! Vui lòng chờ phê duyệt từ admin.");
        setTimeout(() => {
          navigate("/restaurants");
        }, 2000);
      } else {
        setMessage(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error registering restaurant:", error);
      setMessage("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Đang kiểm tra đăng nhập...</div>;
  }

  return (
    <div className="restaurant-register">
      <div className="register-form">
        <h2>Đăng Ký Nhà Hàng</h2>

        {message && (
          <div className={`alert ${message.includes("thành công") ? "alert-success" : "alert-danger"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên Nhà Hàng *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên nhà hàng"
            />
          </div>

          <div className="form-group">
            <label>Địa Chỉ *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div className="form-group">
            <label>Số Điện Thoại *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="form-group">
            <label>Số Bàn *</label>
            <input
              type="number"
              name="tableCount"
              value={formData.tableCount}
              onChange={handleChange}
              required
              min="1"
              placeholder="Nhập số lượng bàn"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantRegister;