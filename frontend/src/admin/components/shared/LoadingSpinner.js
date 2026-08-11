import React from "react";

export default function LoadingSpinner() {
  return (
    <div style={{
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "40px",
        color: "var(--text, #333)"
    }}>
      <div className="adm-spinner" style={{
          width: "40px", 
          height: "40px", 
          border: "4px solid rgba(0, 0, 0, 0.1)", 
          borderTop: "4px solid #3ea6ff", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite",
          marginBottom: "15px"
      }} />
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      <div style={{ fontWeight: "500" }}>Đang nạp dữ liệu...</div>
    </div>
  );
}
