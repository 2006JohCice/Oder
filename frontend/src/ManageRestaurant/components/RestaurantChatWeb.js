import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { apiFetch } from "../../utils/apiFetch";
import "../css/RestaurantChatWeb.css";

const RestaurantChatWeb = ({ restaurant }) => {
  const [socket, setSocket] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // 1. Initialize Socket & Fetch Rooms
  useEffect(() => {
    if (!restaurant) return;
    
    // Fetch rooms
    const fetchChatRooms = async () => {
      try {
        const res = await apiFetch(`/api/admin/chat?restaurant=${restaurant._id}`);
        if (res.rooms) {
           const filteredRooms = res.rooms.filter(r => r._id.includes(restaurant._id));
           // Sort by latest message time if possible
           setChatRooms(filteredRooms);
           if (filteredRooms.length > 0) setActiveRoom(filteredRooms[0]._id);
        }
      } catch (err) {
        console.error("Fetch chat rooms error:", err);
      }
    };
    fetchChatRooms();

    const newSocket = io("http://localhost:5000", { withCredentials: true });
    setSocket(newSocket);
    socketRef.current = newSocket;
    
    // Join global room to receive notifications for ALL chats
    newSocket.emit("join_room", `restaurant_global_${restaurant._id}`);
    
    return () => newSocket.disconnect();
  }, [restaurant]);

  // 2. Handle Active Room Change & History Fetching
  useEffect(() => {
    if (!socket || !activeRoom) return;
    
    socket.emit("join_room", activeRoom);
    
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await apiFetch(`/api/admin/chat/${activeRoom}`);
        if (res.messages) {
          // Lazy rendering: limit to last 100 messages for speed
          const messagesToRender = res.messages.slice(-100).map(m => ({
            id: m._id,
            from: m.sender,
            text: m.text,
            time: m.time
          }));
          setMessages(messagesToRender);
        }
      } catch (err) {
        console.error("Fetch history error:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
    
    // Listen for new messages via global notification (handles messages from ANY room for this restaurant)
    socket.off("restaurant_notification");
    socket.on("restaurant_notification", (notif) => {
       if (notif.type === 'chat') {
          const data = notif.data;
          
          if (data.room === activeRoom) {
             setMessages(prev => [...prev, { id: Date.now(), from: data.sender, text: data.text, time: data.time }]);
             setPartnerTyping(false);
          }
          
          setChatRooms(prevRooms => {
             const exists = prevRooms.find(r => r._id === data.room);
             if (exists) {
                return prevRooms.map(room => room._id === data.room ? { ...room, lastMessage: data.text } : room);
             } else {
                return [{
                   _id: data.room,
                   senderName: data.senderName || "Khách hàng",
                   lastMessage: data.text
                }, ...prevRooms];
             }
          });
       }
    });

    // We can still keep receive_message for messages sent BY the restaurant itself to update its own UI (since restaurant doesn't trigger global notif for its own msgs)
    socket.off("receive_message");
    socket.on("receive_message", (data) => {
      if (data.sender === "restaurant") {
          if (data.room === activeRoom) {
             setMessages(prev => {
                // Prevent duplicate if we already added it locally
                if (!prev.some(m => m.text === data.text && m.time === data.time && m.from === "restaurant")) {
                   return [...prev, { id: Date.now(), from: data.sender, text: data.text, time: data.time }];
                }
                return prev;
             });
          }
          setChatRooms(prevRooms => prevRooms.map(room => 
             room._id === data.room ? { ...room, lastMessage: data.text } : room
          ));
      }
    });

    // Listen for typing indicator
    socket.off("user_typing");
    socket.on("user_typing", (data) => {
       if (data.room === activeRoom && data.sender !== "restaurant") {
          setPartnerTyping(data.isTyping);
       }
    });

  }, [activeRoom, socket]);

  // 3. Scroll to bottom smoothly when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // 4. Handle Typing
  const handleTyping = (e) => {
     setInputMsg(e.target.value);
     if (!socket || !activeRoom) return;
     
     socket.emit("typing", { room: activeRoom, sender: "restaurant", isTyping: true });
     
     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
     typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { room: activeRoom, sender: "restaurant", isTyping: false });
     }, 1000);
  };

  // 5. Send Message
  const sendMessage = (e) => {
     e.preventDefault();
     if (!inputMsg.trim() || !socket || !activeRoom) return;
     
     const newMsgData = {
        room: activeRoom,
        sender: "restaurant",
        senderName: restaurant.name,
        text: inputMsg,
        time: new Date().toLocaleTimeString('vi-VN', { hour: "2-digit", minute: "2-digit" })
     };
     
     socket.emit("send_message", newMsgData);
     
     // Update room list immediately for snappiness
     setChatRooms(prevRooms => prevRooms.map(room => {
        if (room._id === activeRoom) {
           return { ...room, lastMessage: inputMsg };
        }
        return room;
     }));
     
     setInputMsg("");
  };

  // 6. Get active room details
  const currentRoomDetails = chatRooms.find(r => r._id === activeRoom);
  const activeRoomName = currentRoomDetails ? (currentRoomDetails.senderName || "Khách hàng") : "";

  return (
    <div className="ro-chatweb-container">
      {/* SIDEBAR */}
      <div className={`ro-chatweb-sidebar ${activeRoom ? 'hidden-on-mobile' : ''}`}>
        <div className="ro-chatweb-sidebar-header">
          <h2>Tin nhắn</h2>
        </div>
        <div className="ro-chatweb-search">
          <input type="text" placeholder="Tìm kiếm hội thoại..." />
        </div>
        <div className="ro-chatweb-room-list">
          {chatRooms.length === 0 ? (
             <div style={{ padding: 20, textAlign: 'center', color: '#a0aec0' }}>Chưa có tin nhắn nào</div>
          ) : (
            chatRooms.map(room => {
               const isActive = room._id === activeRoom;
               const initial = (room.senderName || "K")[0].toUpperCase();
               return (
                 <div 
                   key={room._id} 
                   className={`ro-chatweb-room ${isActive ? 'active' : ''}`}
                   onClick={() => setActiveRoom(room._id)}
                 >
                   <div className="ro-chatweb-avatar">{initial}</div>
                   <div className="ro-chatweb-room-info">
                     <div className="ro-chatweb-room-name">{room.senderName || "Khách hàng"}</div>
                     <div className="ro-chatweb-room-lastmsg">{room.lastMessage || "..."}</div>
                   </div>
                 </div>
               );
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      {activeRoom ? (
        <div className="ro-chatweb-main mobile-full">
          <div className="ro-chatweb-main-header">
             <div className="ro-chatweb-main-title">
                <button className="ro-chatweb-back-btn" onClick={() => setActiveRoom(null)}>
                   <i className="bi bi-chevron-left"></i>
                </button>
                <div className="ro-chatweb-avatar" style={{width: 40, height: 40, fontSize: 16}}>
                   {(activeRoomName)[0]?.toUpperCase()}
                </div>
                {activeRoomName}
             </div>
          </div>
          
          <div className="ro-chatweb-messages">
             {loadingHistory ? (
                <div style={{ textAlign: 'center', color: '#a0aec0', padding: 20 }}>Đang tải tin nhắn...</div>
             ) : (
                <>
                  {messages.map((m) => {
                     const isMe = m.from === "restaurant";
                     return (
                       <div key={m.id} className={`ro-chatweb-bubble-wrapper ${isMe ? 'me' : 'other'}`}>
                         <div className="ro-chatweb-bubble">{m.text}</div>
                         <div className="ro-chatweb-time">{m.time}</div>
                       </div>
                     );
                  })}
                  {partnerTyping && (
                    <div className="ro-chatweb-bubble-wrapper other">
                       <div className="ro-chatweb-bubble typing-dots">
                          <span></span><span></span><span></span>
                       </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
             )}
          </div>

          <div className="ro-chatweb-input-area">
             <form onSubmit={sendMessage}>
                <input 
                  type="text" 
                  className="ro-chatweb-input"
                  placeholder={`Nhắn tin cho ${activeRoomName}...`}
                  value={inputMsg}
                  onChange={handleTyping}
                />
                <button type="submit" className="ro-chatweb-send-btn">
                  <i className="bi bi-send-fill"></i>
                </button>
             </form>
          </div>
        </div>
      ) : (
        <div className="ro-chatweb-empty">
           <i className="bi bi-chat-dots" style={{fontSize: 60, color: '#cbd5e0', marginBottom: 15}}></i>
           <div>Chọn một hội thoại để bắt đầu trò chuyện</div>
        </div>
      )}
    </div>
  );
};

export default RestaurantChatWeb;
