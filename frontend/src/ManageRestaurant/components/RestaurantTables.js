import React, { useState, useEffect } from "react";
import "../css/MerchantTables.css";

const RestaurantTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dragging State
  const [draggingId, setDraggingId] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Area / Floors State
  const [areas, setAreas] = useState(["Tầng 1"]);
  const [activeArea, setActiveArea] = useState("Tầng 1");
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  // Selection & Right Sidebar State
  const [selectedTableId, setSelectedTableId] = useState(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/restaurant/tables", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        const fetchedTables = (data.tables || []).map(t => ({
          ...t,
          x: t.x || 0,
          y: t.y || 0,
          shape: t.shape || "rect-sm",
          area: t.area || "Tầng 1"
        }));
        setTables(fetchedTables);
        
        // Extract unique areas
        const uniqueAreas = Array.from(new Set(fetchedTables.map(t => t.area)));
        if (uniqueAreas.length > 0) {
          setAreas(uniqueAreas);
          if (!uniqueAreas.includes(activeArea)) {
            setActiveArea(uniqueAreas[0]);
          }
        }
      }
    } catch (error) {
      console.error("Fetch tables error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ----- Drag & Drop Handlers -----

  const handleMouseDown = (e, table) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedTableId(table._id);
    setDraggingId(table._id);
    setStartPos({
      x: e.clientX - table.x,
      y: e.clientY - table.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;

    const finalX = Math.max(0, newX);
    const finalY = Math.max(0, newY);

    setTables(prev =>
      prev.map(t =>
        t._id === draggingId ? { ...t, x: finalX, y: finalY } : t
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleCanvasClick = () => {
    // Deselect if clicking on empty canvas
    setSelectedTableId(null);
  };

  useEffect(() => {
    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, startPos]);

  // ----- Toolbar Actions -----

  const handleAddTable = (shape, defaultCapacity, label) => {
    const newTable = {
      _id: "temp-" + Date.now(), // temporary ID
      displayName: label,
      capacity: defaultCapacity,
      shape: shape,
      area: activeArea,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      status: "available"
    };
    setTables(prev => [...prev, newTable]);
    setSelectedTableId(newTable._id);
  };

  const handleConfirmAddArea = (e) => {
    e.preventDefault();
    if (newAreaName.trim() && !areas.includes(newAreaName.trim())) {
      setAreas([...areas, newAreaName.trim()]);
      setActiveArea(newAreaName.trim());
      setShowAreaModal(false);
      setNewAreaName("");
    } else {
      alert("Tên khu vực không hợp lệ hoặc đã tồn tại!");
    }
  };

  // ----- Right Sidebar Actions -----

  const handleUpdateSelected = (field, value) => {
    setTables(prev => prev.map(t => 
      t._id === selectedTableId ? { ...t, [field]: value } : t
    ));
  };

  const handleDeleteSelected = () => {
    showConfirm("Bạn có chắc chắn xoá bàn này khỏi bản đồ? (Cần bấm Lưu sơ đồ để chính thức xoá)", () => {
      setTables(prev => prev.filter(t => t._id !== selectedTableId));
      setSelectedTableId(null);
    });
  };

  // ----- Save Action -----

  const handleSaveMap = async () => {
    setSaving(true);
    try {
      const payload = tables.map(t => ({
        _id: t._id,
        name: t.displayName,
        capacity: t.capacity,
        shape: t.shape,
        area: t.area || "Tầng 1",
        x: t.x,
        y: t.y
      }));
      
      const res = await fetch("/api/restaurant/tables/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tables: payload })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Lưu sơ đồ bàn thành công!");
        fetchTables(); // reload real IDs
        setSelectedTableId(null);
      } else {
        alert(data.message || "Lỗi khi lưu sơ đồ.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi mạng.");
    } finally {
      setSaving(false);
    }
  };

  // ----- Render Helpers -----
  const getTableClass = (t) => {
    let cls = "adm-draggable-table";
    if (t.shape === "round") cls += " adm-table-round";
    else if (t.shape === "rect-lg") cls += " adm-table-rect-lg";
    else cls += " adm-table-rect-sm"; // default square
    
    if (t.status === "occupied") cls += " status-occupied";
    else if (t.status === "booked") cls += " status-booked";
    else cls += " status-available";

    if (t._id === draggingId) cls += " is-dragging";
    if (t._id === selectedTableId) cls += " is-selected";

    return cls;
  };

  const selectedTable = tables.find(t => t._id === selectedTableId);
  const currentTables = tables.filter(t => t.area === activeArea);

  if (loading) {
    return (
      <div className="adm-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{marginLeft: 10}}>Đang tải sơ đồ...</p>
      </div>
    );
  }

  return (
    <div className="adm-page">
      {/* HEADER */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-diagram-3" style={{ color: "#3498DB", marginRight: 10 }}></i> 
            Quản lý sơ đồ bàn
          </h1>
          <p className="adm-page-subtitle">Kéo bàn từ thanh công cụ vào bản đồ, click vào bàn để sửa.</p>
        </div>
        <div>
          <button className="adm-btn-primary" onClick={handleSaveMap} disabled={saving}>
            <i className={saving ? "bi bi-hourglass-split" : "bi bi-cloud-arrow-up"}></i>
            {saving ? "Đang lưu..." : "Đồng bộ & Lưu sơ đồ"}
          </button>
        </div>
      </div>

      <div className="adm-table-layout">
        
        {/* MAIN CANVAS AREA */}
        <div className="adm-table-main">
          {/* TOOLBAR */}
          <div className="adm-table-toolbar">
            <div className="adm-toolbar-item" onClick={() => handleAddTable("rect-sm", 2, "Bàn vuông (2 ng)")}>
              <div className="adm-tool-shape rect-sm"></div> Bàn vuông (2 ng)
            </div>
            <div className="adm-toolbar-item" onClick={() => handleAddTable("rect-sm", 4, "Bàn vuông (4 ng)")}>
              <div className="adm-tool-shape rect-md"></div> Bàn vuông (4 ng)
            </div>
            <div className="adm-toolbar-item" onClick={() => handleAddTable("rect-lg", 8, "Bàn lớn (8 ng)")}>
              <div className="adm-tool-shape rect-lg"></div> Bàn lớn (8 ng)
            </div>
          </div>

          {/* TABS FOR FLOORS / AREAS */}
          <div className="adm-floor-tabs">
            {areas.map((area, idx) => (
              <div 
                key={idx} 
                className={`adm-floor-tab ${activeArea === area ? 'active' : ''}`}
                onClick={() => setActiveArea(area)}
              >
                {area}
              </div>
            ))}
            <div className="adm-floor-tab add-tab" onClick={() => setShowAreaModal(true)}>
              <i className="bi bi-plus-circle"></i> Thêm tầng / khu vực
            </div>
          </div>

          {/* DRAG CANVAS */}
          <div className="adm-drag-canvas" onClick={handleCanvasClick}>
            <div className="adm-map-entrance">LỐI VÀO</div>
            <div className="adm-map-bar">KHU VỰC BAR</div>

            {currentTables.map(t => (
              <div
                key={t._id}
                className={getTableClass(t)}
                style={{ left: t.x, top: t.y }}
                onMouseDown={(e) => handleMouseDown(e, t)}
                onClick={(e) => e.stopPropagation()}
              >
                <div>{t.displayName || "Bàn"}</div>
                <span>({t.capacity} ng)</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR - TABLE SETTINGS */}
        <div className="adm-table-sidebar">
          {selectedTable ? (
            <div className="adm-sidebar-inner">
              <h3 className="adm-sidebar-title">
                <i className="bi bi-sliders"></i> Chỉnh sửa bàn
              </h3>
              
              <div className="adm-form-group">
                <label>Tên bàn hiển thị</label>
                <input 
                  type="text" 
                  className="adm-form-control"
                  value={selectedTable.displayName} 
                  onChange={(e) => handleUpdateSelected("displayName", e.target.value)}
                />
              </div>

              <div className="adm-form-group">
                <label>Số người tối đa (Capacity)</label>
                <input 
                  type="number" 
                  className="adm-form-control"
                  min="1" max="20"
                  value={selectedTable.capacity} 
                  onChange={(e) => handleUpdateSelected("capacity", e.target.value)}
                />
              </div>

              <div className="adm-form-group">
                <label>Khu vực / Tầng</label>
                <select 
                  className="adm-form-control"
                  value={selectedTable.area} 
                  onChange={(e) => handleUpdateSelected("area", e.target.value)}
                >
                  {areas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="adm-form-group">
                <label>Kiểu dáng (Shape)</label>
                <select 
                  className="adm-form-control"
                  value={selectedTable.shape} 
                  onChange={(e) => handleUpdateSelected("shape", e.target.value)}
                >
                  <option value="rect-sm">Vuông nhỏ</option>
                  <option value="rect-lg">Chữ nhật lớn</option>
                  <option value="round">Bàn tròn</option>
                </select>
              </div>

              <div className="adm-form-group">
                <label>Trạng thái giả lập (Mock)</label>
                <select 
                  className="adm-form-control"
                  value={selectedTable.status} 
                  onChange={(e) => handleUpdateSelected("status", e.target.value)}
                >
                  <option value="available">Trống (Available)</option>
                  <option value="occupied">Đang có khách (Occupied)</option>
                  <option value="booked">Đã đặt trước (Booked)</option>
                </select>
                <small style={{display: 'block', marginTop: 5, color: '#a0aec0'}}>*Thực tế trạng thái sẽ tự động đổi qua API</small>
              </div>

              <button className="adm-btn-danger" onClick={handleDeleteSelected}>
                <i className="bi bi-trash"></i> Xóa bàn này
              </button>
            </div>
          ) : (
            <div className="adm-sidebar-empty">
              <i className="bi bi-hand-index"></i>
              <p>Click vào một bàn trên sơ đồ để chỉnh sửa thông tin.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD AREA MODAL */}
      {showAreaModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2>Thêm Tầng / Khu Vực Mới</h2>
              <button className="adm-modal-close" onClick={() => setShowAreaModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleConfirmAddArea}>
              <div className="adm-form-group">
                <label>Tên khu vực (VD: Tầng 3, Sân thượng)</label>
                <input 
                  type="text" 
                  autoFocus
                  className="adm-form-control"
                  placeholder="Nhập tên..." 
                  value={newAreaName} 
                  onChange={(e) => setNewAreaName(e.target.value)}
                />
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn-secondary" onClick={() => setShowAreaModal(false)}>Hủy</button>
                <button type="submit" className="adm-btn-primary">
                  <i className="bi bi-plus-lg"></i> Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Custom Confirm Modal ── */}
      {confirmModal.isOpen && (
        <div className="adm-modal-overlay" style={{zIndex: 9999}}>
          <div className="adm-modal" style={{ maxWidth: '400px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div className="adm-modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', margin: 0 }}>
                <i className="bi bi-exclamation-circle-fill" style={{ color: '#E74C3C', marginRight: '10px', fontSize: '24px' }}></i> 
                Xác nhận thao tác
              </h2>
              <button className="adm-modal-close" onClick={() => setConfirmModal({...confirmModal, isOpen: false})}>&times;</button>
            </div>
            <div style={{ padding: '20px', fontSize: '15px', color: '#4a5568', lineHeight: '1.5' }}>
              {confirmModal.message}
            </div>
            <div className="adm-modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button type="button" className="adm-btn-secondary" style={{ backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', fontWeight: 600 }} onClick={() => setConfirmModal({...confirmModal, isOpen: false})}>Hủy</button>
              <button type="button" className="adm-btn-danger" style={{ backgroundColor: '#E74C3C', fontWeight: 600, border: 'none' }} onClick={() => {
                if (confirmModal.onConfirm) confirmModal.onConfirm();
                setConfirmModal({ isOpen: false, message: "", onConfirm: null });
              }}>
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RestaurantTables;
