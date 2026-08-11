import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "../../css/FloatingChatWidget.css";

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState("main"); // main | ai | admin | restaurant
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [userId, setUserId] = useState("guest_" + Date.now());
  const [userName, setUserName] = useState("Khách");
  const [targetRestaurant, setTargetRestaurant] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const menuRef = useRef(menu);

  useEffect(() => {
    menuRef.current = menu;
  }, [menu]);

  useEffect(() => {
    // Check if logged in
    fetch("/api/user/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setUserId("user_" + data.user._id);
          setUserName(data.user.fullname || data.user.name);
        }
      })
      .catch(() => {});
      
    const handleOpenResChat = (e) => {
       const { restaurantId, restaurantName } = e.detail;
       setMenu("restaurant");
       setTargetRestaurant({ id: restaurantId, name: restaurantName });
       setIsOpen(true);
    };
    window.addEventListener('open_restaurant_chat', handleOpenResChat);
    return () => window.removeEventListener('open_restaurant_chat', handleOpenResChat);
  }, []);

  // Save AI chat history to local storage
  useEffect(() => {
    if (menu === "ai") {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }
  }, [messages, menu]);

  const getRoomName = () => {
     if (menu === "admin") return `support_${userId}`;
     if (menu === "restaurant" && targetRestaurant) return `support_${userId}_res_${targetRestaurant.id}`;
     return null;
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return; // Only connect when open
    
    let currentSocket = socket;
    if (!currentSocket) {
      currentSocket = io("http://localhost:5000", { withCredentials: true });
      setSocket(currentSocket);
      currentSocket.on("receive_message", (data) => {
        if (menuRef.current !== "ai") {
          setMessages((prev) => [...prev, data]);
          setPartnerTyping(false);
        }
      });
      currentSocket.on("user_typing", (data) => {
         if (data.sender !== userId) {
            setPartnerTyping(data.isTyping);
         }
      });
    }

    const roomName = getRoomName();
    if (roomName) {
      currentSocket.emit("join_room", roomName);
      
      // Load history using the public/user endpoint
      fetch(`/api/user/chat/${roomName}`)
        .then(res => res.json())
        .then(data => {
           if (data.messages) {
             setMessages(data.messages.map(m => ({
               sender: m.sender,
               senderName: m.senderName,
               text: m.text,
               time: m.time
             })));
           }
        })
        .catch(console.error);
    }
  }, [isOpen, menu, targetRestaurant, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  const handleTyping = (e) => {
     setInputMsg(e.target.value);
     if (!socket) return;
     const roomName = getRoomName();
     if (!roomName) return;
     
     socket.emit("typing", { room: roomName, sender: userId, isTyping: true });
     
     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
     typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { room: roomName, sender: userId, isTyping: false });
     }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket) return;
    
    const roomName = getRoomName();
    if (!roomName) return;

    const msgData = {
      room: roomName,
      sender: userId,
      senderName: userName,
      text: inputMsg,
      time: new Date().toISOString()
    };

    socket.emit("send_message", msgData);
    setInputMsg("");
  };

  const handleSendAI = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    const userMsg = { sender: "user", text: inputMsg, time: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");
    
    setPartnerTyping(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMsg }),
      });
      const data = await res.json();
      
      const aiMsg = { 
        sender: "ai", 
        text: data.answer || "Xin lỗi, hệ thống AI đang bận.", 
        time: new Date().toISOString() 
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [...prev, { 
        sender: "ai", 
        text: "Lỗi kết nối tới AI. Vui lòng thử lại sau.", 
        time: new Date().toISOString() 
      }]);
    } finally {
      setPartnerTyping(false);
    }
  };

  return (
    <div className="floating-chat-wrapper">
      {isOpen && (
        <div className="floating-chat-panel">
          <div className="chat-header">
            <h4>
              {menu === "main" && "Trợ giúp & Tư vấn"}
              {menu === "ai" && <><i className="bi bi-robot"></i> AI Tư vấn món ăn</>}
              {menu === "admin" && <><i className="bi bi-person-lines-fill"></i> Hỗ trợ khách hàng</>}
              {menu === "restaurant" && targetRestaurant && <><i className="bi bi-shop"></i> {targetRestaurant.name}</>}
            </h4>
            <div className="chat-header-actions">
              {menu === "ai" && (
                <button onClick={() => { localStorage.removeItem("ai_chat_history"); setMessages([]); }} title="Xóa lịch sử chat AI">
                  <i className="bi bi-trash"></i>
                </button>
              )}
              {menu !== "main" && (
                <button onClick={() => setMenu("main")} title="Quay lại"><i className="bi bi-arrow-left"></i></button>
              )}
              <button onClick={toggleWidget}><i className="bi bi-x-lg"></i></button>
            </div>
          </div>

          <div className="chat-body">
            {menu === "main" && (
              <div className="chat-menu">
                <p>Chào {userName}! Chúng tôi có thể giúp gì cho bạn?</p>
                <button className="chat-menu-btn" onClick={() => { 
                  setMenu("ai"); 
                  const saved = localStorage.getItem("ai_chat_history");
                  setMessages(saved ? JSON.parse(saved) : []); 
                }}>
                  <i className="bi bi-robot"></i>
                  <span>Tư vấn món ăn với AI</span>
                </button>
                <button className="chat-menu-btn" onClick={() => { setMenu("admin"); setMessages([]); }}>
                  <i className="bi bi-person-lines-fill"></i>
                  <span>Hỗ trợ trực tuyến (Admin)</span>
                </button>
              </div>
            )}

            {(menu === "ai" || menu === "admin" || menu === "restaurant") && (
              <div className="chat-messages">
                {messages.length === 0 && (
                  <p className="chat-empty">Bắt đầu cuộc trò chuyện...</p>
                )}
                {messages.map((msg, idx) => {
                  const isMe = msg.sender === userId || msg.sender === "user";
                  let senderLabel = msg.senderName;
                  if (!isMe) {
                     if (menu === "ai") senderLabel = "AI Bot";
                     if (menu === "admin") senderLabel = "Admin";
                     if (menu === "restaurant" && msg.sender === "restaurant") senderLabel = targetRestaurant?.name || "Nhà hàng";
                  }
                  
                  return (
                    <div key={idx} className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                      {!isMe && <span className="chat-sender-name">{senderLabel}</span>}
                      <div className="chat-text" dangerouslySetInnerHTML={{ __html: msg.text }}></div>
                      <div className="chat-time">
                        {(() => {
                           const d = new Date(msg.time);
                           return isNaN(d.getTime()) ? msg.time : d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                        })()}
                      </div>
                    </div>
                  );
                })}
                {partnerTyping && (
                   <div className="chat-bubble other">
                      <div className="chat-text typing-indicator">
                         <span></span><span></span><span></span>
                      </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {(menu === "ai" || menu === "admin" || menu === "restaurant") && (
            <div className="chat-footer">
              <form onSubmit={menu === "ai" ? handleSendAI : handleSendMessage} className="chat-form">
                <input 
                  type="text" 
                  value={inputMsg}
                  onChange={menu === "ai" ? (e) => setInputMsg(e.target.value) : handleTyping}
                  placeholder="Nhập tin nhắn..." 
                />
                <button type="submit"><i className="bi bi-send-fill"></i></button>
              </form>
            </div>
          )}
        </div>
      )}

      <button className="floating-chat-toggle" onClick={toggleWidget}>
        {isOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-chat-dots-fill"></i>}
      </button>
    </div>
  );
};

export default FloatingChatWidget;
