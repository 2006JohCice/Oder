import { useEffect, useState } from "react";
import "../css/search-hero.css";

function UserRewardCard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="gp-reward-card gp-logged-out">
        <div className="gp-reward-content">
          <h4>Trở thành viên ngay!</h4>
          <p>Nhận hàng ngàn ưu đãi hấp dẫn.</p>
          <a href="/user/auth/login" className="gp-reward-btn">Đăng nhập / Đăng ký</a>
        </div>
      </div>
    );
  }

  // Ensure points has a fallback for the UI
  const points = user.points !== undefined ? user.points : 0;
  
  let level = "THÀNH VIÊN";
  let nextLevel = "ĐỒNG";
  let pointsToNext = 10000 - points;
  
  if (points >= 10000 && points < 20000) {
      level = "ĐỒNG";
      nextLevel = "BẠC";
      pointsToNext = 20000 - points;
  } else if (points >= 20000 && points < 50000) {
      level = "BẠC";
      nextLevel = "VÀNG";
      pointsToNext = 50000 - points;
  } else if (points >= 50000 && points < 80000) {
      level = "VÀNG";
      nextLevel = "KIM CƯƠNG";
      pointsToNext = 80000 - points;
  } else if (points >= 80000) {
      level = "KIM CƯƠNG";
      nextLevel = "MAX";
      pointsToNext = 0;
  }

  const name = user.fullname || user.name || "Khách hàng";

  return (
    <div className="gp-reward-card">
      <div className="gp-reward-top">
        <div className="gp-user-avatar">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`} alt="Avatar" />
        </div>
        <div className="gp-user-greeting">
          <h4>Chào {name}!</h4>
          <p className="gp-points-text"><i className="bi bi-coin"></i> {points.toLocaleString()} Điểm</p>
        </div>
      </div>

      <div className="gp-reward-progress-box">
        <div className="gp-progress-header">
          <span className="gp-current-rank"><i className="bi bi-award-fill"></i> {level}</span>
          <span className="gp-next-rank">{nextLevel}</span>
        </div>
        <div className="gp-progress-bar-bg">
          <div className="gp-progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, (points / (points + pointsToNext)) * 100))}%` }}></div>
        </div>
        <p className="gp-progress-hint">
          {pointsToNext > 0 ? `Còn ${pointsToNext.toLocaleString()} điểm nữa để thăng hạng` : `Bạn đã đạt hạng cao nhất!`}
        </p>
      </div>

      <a href="/user/settings" className="gp-reward-btn">
        <i className="bi bi-gift-fill"></i> Đổi ưu đãi ngay
      </a>
    </div>
  );
}

export default UserRewardCard;
