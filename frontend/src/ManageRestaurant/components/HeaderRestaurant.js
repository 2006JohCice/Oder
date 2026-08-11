import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../css/RestaurantOwnerLayout.css";

const HeaderRestaurant = ({ user, restaurant, toggleSidebar }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!restaurant) return;
    const socket = io("http://localhost:5000", { withCredentials: true });
    socket.emit("join_room", `restaurant_global_${restaurant._id}`);
    
    socket.on("restaurant_notification", (notif) => {
        if (notif.type === 'chat') {
           setUnreadCount(prev => prev + 1);
        }
    });

    return () => socket.disconnect();
  }, [restaurant]);

  const handleChatClick = () => {
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
    navigate("/restaurant-owner/chat"); // Navigate to the new full-screen chat page
  };
  return (
    <header className="ro-top-header">
      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        <button className="ro-mobile-menu-btn" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <div className="ro-top-header-title">Quản Lý Nhà Hàng</div>
      </div>
      
      <div className="ro-top-header-right">
        <div className="ro-search-bar">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
        
        <div className="ro-icon-btn" style={{ position: 'relative' }} onClick={handleChatClick}>
          <i className="bi bi-chat-dots"></i>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-5px', right: '-5px', 
              background: '#c90000', color: 'white', borderRadius: '50%', 
              padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        <div className="ro-icon-btn">
          <i className="bi bi-bell"></i>
        </div>
        
        <img 
          src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"} 
          alt="Avatar" 
          className="ro-avatar" 
        />
      </div>
    </header>
  );
};

export default HeaderRestaurant;
