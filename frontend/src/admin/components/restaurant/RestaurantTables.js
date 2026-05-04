import { useEffect, useState } from "react";

const emptyTable = { name: "", area: "", capacity: 4, note: "" };

const RestaurantTables = () => {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState(emptyTable);
  const [loading, setLoading] = useState(true);

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/tables", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setTables(data.tables || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const createTable = async () => {
    const res = await fetch("/api/restaurant/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newTable),
    });
    const data = await res.json();
    alert(data.message || "Đã xử lý");
    if (res.ok) {
      setNewTable(emptyTable);
      loadTables();
    }
  };

  const updateTable = async (table) => {
    const res = await fetch(`/api/restaurant/tables/${table._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: table.displayName,
        area: table.area,
        capacity: table.capacity,
        note: table.note,
        status: table.status,
      }),
    });
    const data = await res.json();
    alert(data.message || "Đã xử lý");
    loadTables();
  };

  const deleteTable = async (tableId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Bạn chắc chắn muốn xóa bàn này?")) return;
    const res = await fetch(`/api/restaurant/tables/${tableId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    alert(data.message || "Đã xử lý");
    loadTables();
  };

  if (loading) return <div className="loading">Đang tải danh sách bàn...</div>;

  return (
    <div className="restaurant-settings">
      <div className="page-header"><h2>Quản lý bàn ăn</h2></div>

      <div className="form-section" style={{ marginBottom: 18 }}>
        <h3>Thêm bàn mới</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <input placeholder="Tên bàn" value={newTable.name} onChange={(e) => setNewTable({ ...newTable, name: e.target.value })} />
          <input placeholder="Khu vực" value={newTable.area} onChange={(e) => setNewTable({ ...newTable, area: e.target.value })} />
          <input type="number" min="1" placeholder="Sức chứa" value={newTable.capacity} onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })} />
          <input placeholder="Ghi chú" value={newTable.note} onChange={(e) => setNewTable({ ...newTable, note: e.target.value })} />
          <button type="button" className="btn btn-primary" onClick={createTable}>Thêm bàn</button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {tables.map((table) => (
          <div key={table._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, display: "grid", gap: 8 }}>
            <input value={table.displayName || ""} onChange={(e) => setTables((prev) => prev.map((t) => (t._id === table._id ? { ...t, displayName: e.target.value } : t)))} />
            <input value={table.area || ""} onChange={(e) => setTables((prev) => prev.map((t) => (t._id === table._id ? { ...t, area: e.target.value } : t)))} />
            <input type="number" min="1" value={table.capacity || 4} onChange={(e) => setTables((prev) => prev.map((t) => (t._id === table._id ? { ...t, capacity: Number(e.target.value) } : t)))} />
            <input value={table.note || ""} onChange={(e) => setTables((prev) => prev.map((t) => (t._id === table._id ? { ...t, note: e.target.value } : t)))} />
            <select value={table.status || "available"} onChange={(e) => setTables((prev) => prev.map((t) => (t._id === table._id ? { ...t, status: e.target.value } : t)))}>
              <option value="available">Sẵn sàng</option>
              <option value="occupied">Đang dùng</option>
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-primary" onClick={() => updateTable(table)}>Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={() => deleteTable(table._id)}>Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && <p>Chưa có bàn nào.</p>}
    </div>
  );
};

export default RestaurantTables;
