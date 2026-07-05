import React, { useState, useEffect, useCallback } from "react";
import "../../../css/RestaurantReview.css";

const RestaurantReview = ({ restaurantId, readOnly = false }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ average: 5.0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    rating: 5,
    feedback: "",
    fullname: "",
    email: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/feedback/restaurant/${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.feedbacks || []);
        if (data.ratingAverage !== undefined) {
          setRatingStats({ average: data.ratingAverage, count: data.ratingCount });
        }
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setRating = (ratingValue) => {
    setFormData(prev => ({ ...prev, rating: ratingValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        rating: formData.rating,
        feedback: formData.feedback,
        fullname: "Khách hàng", // hardcode as we don't have user input for it in UI anymore
        email: ""
      };

      const res = await fetch(`/api/feedback/restaurant/${restaurantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage("Gửi đánh giá thành công!");
        setFormData({ ...formData, feedback: "", rating: 5 });
        fetchReviews(); // Reload list
      } else {
        setMessage(data.message || "Gửi đánh giá thất bại.");
      }
    } catch (error) {
      setMessage("Lỗi kết nối máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="restaurant-review-section">
      <div className="rr-header-row">
        <h3>Đánh Giá Thực Khách</h3>
        <div className="rr-overall-rating">
          {ratingStats.average > 0 ? ratingStats.average.toFixed(1) : "5.0"} 
          <i className="bi bi-star-fill"></i>
        </div>
      </div>

      <div className="reviews-wrapper">
        {loading ? (
          <p style={{ color: '#a0aec0' }}>Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: '#a0aec0' }}>Chưa có đánh giá nào cho nhà hàng này.</p>
        ) : (
          reviews.map((rv) => {
            const name = rv.fullname || "Khách ẩn danh";
            const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            
            // Format time ago roughly
            const diffMs = new Date() - new Date(rv.createdAt);
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const timeAgo = diffDays === 0 ? "Hôm nay" : diffDays < 7 ? `${diffDays} ngày trước` : `${Math.floor(diffDays/7)} tuần trước`;

            return (
              <div key={rv._id} className="review-item">
                <div className="review-header">
                  <div className="review-user-info">
                    <div className="review-avatar">{initials}</div>
                    <div className="review-meta">
                      <strong>{name}</strong>
                      <small>{timeAgo}</small>
                    </div>
                  </div>
                  <span className="review-stars">
                    {"★".repeat(rv.rating || 5)}{"☆".repeat(5 - (rv.rating || 5))}
                  </span>
                </div>
                <p className="review-text">{rv.feedback}</p>
              </div>
            );
          })
        )}
      </div>

      {!readOnly && (
        <div className="review-form-container">
          <form onSubmit={handleSubmit} className="review-form">
            <textarea 
              name="feedback" 
              placeholder="Chia sẻ cảm nhận của bạn về món ăn này..." 
              value={formData.feedback} 
              onChange={handleChange} 
              rows="3"
              required 
            ></textarea>
            
            <div className="review-form-footer">
              <div className="star-rating-select">
                Xếp hạng: 
                <div className="stars-select">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      className={formData.rating >= star ? 'active' : ''}
                      onClick={() => setRating(star)}
                    >
                      {formData.rating >= star ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="btn-submit-review" disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
            {message && <div className="review-message">{message}</div>}
          </form>
        </div>
      )}
    </div>
  );
};

export default RestaurantReview;
