import React, { useEffect, useState } from "react";
import "../../css/MerchantFeedbacks.css";

const RestaurantFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch("/api/restaurant/feedbacks", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setFeedbacks(data.feedbacks || []);
        }
      } catch (error) {
        console.error("Fetch feedbacks error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  if (loading) return <div>Đang tải đánh giá từ khách hàng...</div>;

  return (
    <>
      <div className="ro-page-header">
        <div>
          <h1>Phản hồi & Chăm sóc khách hàng</h1>
          <p>Quản lý đánh giá thực tế từ Database API.</p>
        </div>
        <div style={{display: 'flex', gap: 15}}>
          <button className="ro-btn-outline"><i className="bi bi-funnel"></i> Lọc</button>
          <button className="ro-btn-primary"><i className="bi bi-download"></i> Xuất báo cáo</button>
        </div>
      </div>

      <div className="ro-feedbacks-stats">
        <div className="ro-stat-card">
          <div className="ro-stat-card-top">
            <div className="ro-stat-icon red"><i className="bi bi-chat-left-text"></i></div>
          </div>
          <div className="ro-stat-label">Tổng đánh giá</div>
          <div className="ro-stat-value">{feedbacks.length}</div>
        </div>
        
        <div className="ro-stat-card">
          <div className="ro-stat-card-top">
            <div className="ro-stat-icon orange"><i className="bi bi-star-fill"></i></div>
          </div>
          <div className="ro-stat-label">Điểm trung bình</div>
          <div className="ro-stat-value">5.0 <small>/ 5.0</small></div>
        </div>

        <div className="ro-stat-card">
          <div className="ro-stat-card-top">
            <div className="ro-stat-icon green"><i className="bi bi-headset"></i></div>
          </div>
          <div className="ro-stat-label">Tỷ lệ phản hồi</div>
          <div className="ro-stat-value">100%</div>
        </div>

        <div className="ro-stat-card">
          <div className="ro-stat-card-top">
            <div className="ro-stat-icon red"><i className="bi bi-exclamation-circle"></i></div>
            <div className="ro-stat-badge alert">CẦN XỬ LÝ</div>
          </div>
          <div className="ro-stat-label">Tickets chưa giải quyết</div>
          <div className="ro-stat-value danger">0</div>
        </div>
      </div>

      <div className="ro-feedbacks-layout">
        
        {/* LEFT COLUMN: REVIEWS */}
        <div>
          <div className="ro-section-header">
            <h3>Đánh giá gần đây</h3>
            <span className="ro-section-link">Xem tất cả</span>
          </div>

          <div className="ro-reviews-list">
            {feedbacks.length === 0 ? (
              <div style={{padding: 20, textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#718096'}}>
                Hiện chưa có đánh giá nào từ khách hàng.
              </div>
            ) : (
              feedbacks.map(fb => (
                <div className="ro-review-card" key={fb._id}>
                  <div className="ro-review-user">
                    <img src={fb.user_id?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"} alt="User" />
                    <div className="ro-review-user-info">
                      <h5>{fb.user_id?.fullName || "Khách hàng"}</h5>
                      <p>{new Date(fb.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="ro-review-rating"><i className="bi bi-star-fill"></i> {fb.rating}/5</div>
                  </div>
                  <div className="ro-review-text">{fb.comment}</div>
                  <div className="ro-review-actions">
                    <button className="ro-review-action-btn reply"><i className="bi bi-reply-fill"></i> Phản hồi</button>
                    <button className="ro-review-action-btn"><i className="bi bi-hand-thumbs-up"></i> Hữu ích</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SUPPORT TICKETS (MOCK) */}
        <div>
          <div className="ro-section-header">
            <h3>Yêu cầu hỗ trợ</h3>
            <i className="bi bi-three-dots-vertical" style={{cursor: 'pointer', color: '#a0aec0'}}></i>
          </div>

          <div className="ro-tickets-list">
            
            <div className="ro-ticket-card">
              <div className="ro-ticket-top">
                <span className="ro-ticket-id">#TK-8921</span>
                <span className="ro-ticket-badge resolved">ĐÃ GIẢI QUYẾT</span>
              </div>
              <h4 className="ro-ticket-title">Mô phỏng Ticket</h4>
              <p className="ro-ticket-desc">Hệ thống Ticket sẽ được nối API sau.</p>
              <div className="ro-ticket-footer">
                <div className="ro-ticket-user">
                  <div style={{width:20,height:20,background:'#edf2f7',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>C</div>
                  Gourmet Pulse Admin
                </div>
                <div className="ro-ticket-time">Hôm qua</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default RestaurantFeedbacks;
