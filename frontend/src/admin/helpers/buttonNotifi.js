import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { apiFetch } from "../../utils/apiFetch";
import "../css/components/HeaderAdmin.css"; // Ensure styles are here

function ButtonNotifi() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch initial notifications
        const fetchNotifications = async () => {
            try {
                const data = await apiFetch("/api/admin/notifications");
                if (data.notifications) {
                    setNotifications(data.notifications);
                    setUnreadCount(data.unreadCount);
                }
            } catch (error) {
                console.error("Lỗi lấy thông báo:", error);
            }
        };

        fetchNotifications();

        // Connect to Socket.IO
        const socket = io("http://localhost:5000", {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("Đã kết nối Socket.IO tới Backend");
        });

        socket.on("new_notification", (newNotification) => {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const markAsRead = async (id) => {
        try {
            await apiFetch(`/api/admin/notifications/mark-read/${id}`, { method: "PATCH" });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Lỗi đánh dấu đã đọc:", error);
        }
    };

    return (
        <div className="admin-btn-notifi-container" style={{ position: "relative" }}>
            <button 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false" 
                className="admin-btn"
                style={{ position: "relative", border: "none", background: "transparent", color: "var(--text)" }}
            >
                <i className="bi bi-bell" style={{ fontSize: "1.2rem" }}></i>
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute", top: "0px", right: "0px",
                        background: "red", color: "white", borderRadius: "50%",
                        padding: "2px 6px", fontSize: "0.7rem", fontWeight: "bold"
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <div className="dropdown-menu dropdown-menu-end shadow" style={{ width: "380px", padding: "0", background: "#212121", color: "#fff", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ padding: "15px", borderBottom: "1px solid #3d3d3d", fontSize: "1.1rem", fontWeight: "bold" }}>
                    Thông báo
                </div>
                
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#aaa" }}>
                            Chưa có thông báo nào.
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <div 
                                key={item._id} 
                                onClick={() => { markAsRead(item._id); if(item.link) window.location.href = item.link; }}
                                style={{ 
                                    display: "flex", alignItems: "center", padding: "12px 15px", 
                                    borderBottom: "1px solid #3d3d3d", cursor: "pointer",
                                    background: item.isRead ? "transparent" : "rgba(255, 255, 255, 0.05)",
                                    transition: "background 0.2s"
                                }}
                                className="notifi-item-hover"
                            >
                                {/* Unread Dot */}
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.isRead ? "transparent" : "#3ea6ff", marginRight: "10px", flexShrink: 0 }}></div>
                                
                                {/* Icon */}
                                <div style={{ 
                                    width: "40px", height: "40px", borderRadius: "50%", background: "#fff", color: "#000",
                                    display: "flex", alignItems: "center", justifyContent: "center", marginRight: "15px", flexShrink: 0 
                                }}>
                                    <i className={`bi ${item.icon}`} style={{ fontSize: "1.2rem" }}></i>
                                </div>
                                
                                {/* Content */}
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                    <div style={{ fontSize: "0.95rem", fontWeight: item.isRead ? "normal" : "500", marginBottom: "4px", color: "#f1f1f1", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {item.message}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
                                    </div>
                                </div>

                                {/* Menu Icon */}
                                <div style={{ paddingLeft: "10px", color: "#aaa" }}>
                                    <i className="bi bi-three-dots-vertical"></i>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Inject Hover CSS directly for ease, could be moved to CSS file */}
            <style>{`
                .notifi-item-hover:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
            `}</style>
        </div>
    );
}

export default ButtonNotifi;