import { useEffect, useState } from "react";
import "../../css/RestaurantManagement.css";

const RestaurantFeedbacks = ({ restaurant }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/restaurant/feedbacks", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data.feedbacks || []);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error("Error loading feedbacks", error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((item) => filter === "all" || item.sentiment === filter);
  const goodCount = feedbacks.filter((item) => item.sentiment === "good").length;
  const badCount = feedbacks.filter((item) => item.sentiment === "bad").length;

  if (loading) {
    return <div className="loading">Đang tải phản hồi...</div>;
  }

  return (
    <div className="restaurant-management">
      <div className="admin-header">
        <div>
          <h2>Phản hồi khách hàng</h2>
          <p>Danh sách góp ý, đánh giá tốt / xấu của khách dành cho nhà hàng.</p>
        </div>
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="good">Tốt</option>
            <option value="bad">Xấu</option>
          </select>
        </div>
      </div>

      <div className="admin-header" style={{ gap: 16 }}>
        <div className="stat-card" style={{ flex: 1, padding: "16px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
          <h3>{goodCount}</h3>
          <p>Phản hồi tốt</p>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: "16px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
          <h3>{badCount}</h3>
          <p>Phản hồi xấu</p>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredFeedbacks.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Nhà hàng</th>
                <th>Phản hồi</th>
                <th>Đánh giá</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((item) => (
                <tr key={item._id || item.id || `${item.email}-${item.createdAt}`}>
                  <td>{item.fullname || "Khách"}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.restaurant || restaurant?.name || "-"}</td>
                  <td>{item.feedback}</td>
                  <td className={item.sentiment === "good" ? "text-success" : "text-danger"}>
                    {item.sentiment === "good" ? "Tốt" : "Xấu"}
                  </td>
                  <td>{new Date(item.createdAt || item.date || Date.now()).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">Không có phản hồi nào.</div>
        )}
      </div>
    </div>
  );
};

export default RestaurantFeedbacks;
