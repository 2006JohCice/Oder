import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

export default function UserVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch("/api/user/my-vouchers", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setVouchers(data.data?.vouchers || data.vouchers || []);
        }
      } catch (e) {
        console.error("Lỗi khi lấy voucher", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  return (
    <div className="container" style={{ padding: "40px 0", minHeight: "60vh" }}>
      <h2 style={{ marginBottom: "20px", fontWeight: "bold" }}>
        <i className="bi bi-ticket-perforated"></i> Kho Voucher Của Bạn
      </h2>
      <p style={{ color: "#64748b", marginBottom: "30px" }}>
        Tất cả mã giảm giá bạn đã lưu hoặc đổi từ điểm thưởng.
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary"></div>
        </div>
      ) : vouchers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px" }}>
          <i className="bi bi-ticket-detailed" style={{ fontSize: "40px", color: "#cbd5e1" }}></i>
          <h4 style={{ marginTop: "15px", color: "#475569" }}>Bạn chưa có mã giảm giá nào.</h4>
          <p style={{ color: "#94a3b8" }}>Hãy tích điểm và đổi ưu đãi hoặc lưu từ các nhà hàng nhé!</p>
          <Link to="/restaurants" className="btn btn-primary mt-3">Khám phá nhà hàng</Link>
        </div>
      ) : (
        <div className="row">
          {vouchers.map(v => (
            <div className="col-md-6 col-xl-6 mb-4" key={v._id}>
              <div style={{ 
                display: 'flex', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                position: 'relative', 
                background: '#fff',
                height: '100%',
                overflow: 'hidden'
              }}>
                
                {/* Left Part */}
                <div style={{ 
                  width: '130px', 
                  minWidth: '130px',
                  background: v.discountType === 'percent' ? '#f59e0b' : '#ef4444', 
                  position: 'relative', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  padding: '10px' 
                }}>
                  <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '0.5px' }}>
                    {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue / 1000}K`}
                  </h3>
                  <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                    GIẢM
                  </span>
                  
                  {/* Left outer cutout */}
                  <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', backgroundColor: '#f8fafc', borderRadius: '50%', boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.04)' }}></div>
                  {/* Right inner cutout */}
                  <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', backgroundColor: '#fff', borderRadius: '50%', zIndex: 2 }}></div>
                </div>
                
                {/* Dashed line */}
                <div style={{ 
                  width: '0px', 
                  borderLeft: '2px dashed #e2e8f0', 
                  zIndex: 1, 
                  position: 'relative',
                  margin: '10px 0'
                }}></div>
                
                {/* Right Part */}
                <div style={{ flex: 1, padding: '16px 20px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b', letterSpacing: '0.5px' }}>
                      {v.code}
                    </h4>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      background: v.restaurant_id ? '#e0f2fe' : '#ecfdf5',
                      color: v.restaurant_id ? '#0284c7' : '#059669',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {v.restaurant_id ? 'Quán Ăn' : 'Hoạt Động'}
                    </span>
                  </div>
                  
                  <div style={{ color: '#475569', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>
                    <i className="bi bi-cart3" style={{ marginRight: '8px', color: '#94a3b8' }}></i>
                    Đơn tối thiểu: <strong style={{ color: '#1e293b' }}>{v.minOrderValue ? v.minOrderValue.toLocaleString() : 0}đ</strong>
                  </div>
                  
                  <div style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
                    <i className="bi bi-calendar3" style={{ marginRight: '8px', color: '#94a3b8' }}></i>
                    HSD: <strong style={{ color: '#1e293b' }}>{new Date(v.expirationDate).toLocaleDateString('vi-VN')}</strong>
                  </div>
                  
                  <div style={{ height: '1px', background: '#f1f5f9', margin: 'auto 0 12px 0' }}></div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(v.code);
                        notifyApp("Đã copy mã: " + v.code, "success");
                      }}
                      style={{ flex: 1, padding: '6px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569' }}
                    >
                      <i className="bi bi-copy"></i> Copy mã
                    </button>
                    
                    {v.restaurant_id ? (
                      <Link to={`/restaurant/${v.restaurant_id.slug}/products`} className="btn" style={{ flex: 1, padding: '6px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', textAlign: 'center', textDecoration: 'none' }}>
                        Dùng ngay
                      </Link>
                    ) : (
                      <Link to="/restaurants" className="btn" style={{ flex: 1, padding: '6px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', textAlign: 'center', textDecoration: 'none' }}>
                        Dùng ngay
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
