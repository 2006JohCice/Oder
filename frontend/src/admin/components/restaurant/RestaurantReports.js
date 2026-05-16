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
        const data = await res.json();
        if (res.ok) {
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
    return <div className="loading">Dang tai bao cao...</div>;
  }

  return (
    <div className="restaurant-management">
      <div className="admin-header">
        <div>
          <h2>Bao cao nha hang</h2>
          <p>Danh sach bao cao tu nguoi dung gui den bo phan quan tri.</p>
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
          <p>Bao cao nhan xet tot</p>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: "16px", background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
          <h3>{badCount}</h3>
          <p>Bao cao can xu ly</p>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredReports.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khach hang</th>
                <th>Email</th>
                <th>Nha hang</th>
                <th>Noi dung bao cao</th>
                <th>Danh gia</th>
                <th>Ngay</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((item) => (
                <tr key={item._id || `${item.email}-${item.createdAt}`}>
                  <td>{item.fullname || "Khach"}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.restaurant || restaurant?.name || "-"}</td>
                  <td>{item.report}</td>
                  <td className={item.sentiment === "good" ? "text-success" : "text-danger"}>
                    {item.sentiment === "good" ? "Tot" : "Xau"}
                  </td>
                  <td>{new Date(item.createdAt || Date.now()).toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">Khong co bao cao nao.</div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReports;
