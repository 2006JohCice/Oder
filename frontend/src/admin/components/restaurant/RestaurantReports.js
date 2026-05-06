import { useEffect, useState } from "react";
import "../../css/RestaurantManagement.css";

const RestaurantReports = ({ restaurant }) => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/restaurant/reports", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error("Error loading reports", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const filteredReports = reports.filter((item) => filter === "all" || item.sentiment === filter);
  const goodCount = reports.filter((item) => item.sentiment === "good").length;
  const badCount = reports.filter((item) => item.sentiment === "bad").length;

  if (loading) {
    return <div className="loading">Đang tải báo cáo...</div>;
  }

  return (
    <div className="restaurant-management">
      <div className="admin-header">
        <div>
          <h2>Báo cáo nhà hàng</h2>
          <p>Danh sách báo cáo gửi về admin, bao gồm đánh giá tốt và xấu.</p>
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
          <p>Báo cáo tốt</p>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: "16px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
          <h3>{badCount}</h3>
          <p>Báo cáo xấu</p>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredReports.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Nhà hàng</th>
                <th>Nội dung báo cáo</th>
                <th>Đánh giá</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((item) => (
                <tr key={item._id || item.id || `${item.email}-${item.createdAt}`}>
                  <td>{item.fullname || "Khách"}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.restaurant || restaurant?.name || "-"}</td>
                  <td>{item.report}</td>
                  <td className={item.sentiment === "good" ? "text-success" : "text-danger"}>
                    {item.sentiment === "good" ? "Tốt" : "Xấu"}
                  </td>
                  <td>{new Date(item.createdAt || item.date || Date.now()).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">Không có báo cáo nào.</div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReports;
