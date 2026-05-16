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
        const data = await res.json();
        if (res.ok) {
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
    return <div className="loading">Dang tai phan hoi...</div>;
  }

  return (
    <div className="restaurant-management">
      <div className="admin-header">
        <div>
          <h2>Phan hoi khach hang</h2>
          <p>Tong hop danh gia va muc do hai long cua khach cho nha hang.</p>
        </div>
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tat ca</option>
            <option value="good">Tot</option>
            <option value="bad">Xau</option>
          </select>
        </div>
      </div>

      <div className="admin-header" style={{ gap: 16 }}>
        <div className="stat-card" style={{ flex: 1, padding: "16px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
          <h3>{goodCount}</h3>
          <p>Phan hoi tot</p>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: "16px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
          <h3>{badCount}</h3>
          <p>Phan hoi can cai thien</p>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredFeedbacks.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khach hang</th>
                <th>Email</th>
                <th>Nha hang</th>
                <th>Noi dung</th>
                <th>Danh gia</th>
                <th>Ngay</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((item) => (
                <tr key={item._id || `${item.email}-${item.createdAt}`}>
                  <td>{item.fullname || "Khach"}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.restaurant || restaurant?.name || "-"}</td>
                  <td>{item.feedback}</td>
                  <td className={item.sentiment === "good" ? "text-success" : "text-danger"}>
                    {item.sentiment === "good" ? "Tot" : "Xau"} {item.rating ? `- ${item.rating}/5` : ""}
                  </td>
                  <td>{new Date(item.createdAt || Date.now()).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">Khong co phan hoi nao.</div>
        )}
      </div>
    </div>
  );
};

export default RestaurantFeedbacks;
