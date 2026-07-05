import React from "react";
import "../../css/RestaurantOwnerLayout.css";

const HeaderRestaurant = ({ user, toggleSidebar }) => {
  return (
    <header className="ro-top-header">
      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        <button className="ro-mobile-menu-btn" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <div className="ro-top-header-title">Merchant Suite</div>
      </div>
      
      <div className="ro-top-header-right">
        <div className="ro-search-bar">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search..." />
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
