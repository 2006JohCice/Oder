import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { apiFetch } from "../../../utils/apiFetch";
import "../../css/shared/admin-components.css";
import "../../css/chatting/ChatUI.css";

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const scrollRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [messageCache, setMessageCache] = useState({});

  useEffect(() => {
    // Fetch rooms
    const fetchRooms = async () => {
      try {
        const res = await apiFetch("/api/admin/chat");
        if (res.rooms) {
          setRooms(res.rooms);
          if (res.rooms.length > 0) {
            setActiveRoom(res.rooms[0]._id);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách chat:", err);
      }
    };
    fetchRooms();

    // Connect Socket.IO
    const newSocket = io("http://localhost:5000", { withCredentials: true });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!activeRoom || !socket) return;

    // Join room when activeRoom changes
    socket.emit("join_room", activeRoom);

    // Clear or load cache immediately
    setMessages(messageCache[activeRoom] || []);

    // Fetch initial chat history
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/api/admin/chat/${activeRoom}`);
        if (res.messages) {
          const formatted = res.messages.map(m => ({
            id: m._id,
            from: m.sender,
            text: m.text,
            time: m.time
          }));
          setMessages(formatted);
          setMessageCache(prev => ({ ...prev, [activeRoom]: formatted }));
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử chat:", err);
      }
    };
    fetchHistory();


    // Clean up listeners for this room
    socket.off("receive_message");

    socket.on("receive_message", (data) => {
      if (data.room === activeRoom) {
        const newMsg = { id: Date.now(), from: data.sender, text: data.text, time: data.time };
        setMessages((prev) => [...prev, newMsg]);
        setMessageCache(prev => ({ ...prev, [activeRoom]: [...(prev[activeRoom] || []), newMsg] }));
      } else {
        // Update cache for background room
        const newMsg = { id: Date.now(), from: data.sender, text: data.text, time: data.time };
        setMessageCache(prev => ({ ...prev, [data.room]: [...(prev[data.room] || []), newMsg] }));
      }

      // Update room list latest message
      setRooms((prevRooms) => {
        const newRooms = [...prevRooms];
        const rIndex = newRooms.findIndex(r => r._id === data.room);
        if (rIndex > -1) {
          newRooms[rIndex].lastMessage = data.text;
          newRooms[rIndex].lastTime = data.time;
          // Move to top
          const r = newRooms.splice(rIndex, 1)[0];
          newRooms.unshift(r);
        } else {
          // New room
          newRooms.unshift({
            _id: data.room,
            lastMessage: data.text,
            lastTime: data.time,
            senderName: data.senderName || "Unknown"
          });
        }
        return newRooms;
      });
    });

  }, [activeRoom, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text || !socket) return;

    const time = new Date().toISOString();
    const newMsgData = {
      room: activeRoom,
      sender: "admin",
      senderName: "Admin",
      text,
      time
    };

    socket.emit("send_message", newMsgData);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="adm-page" style={{ padding: "20px" }}>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <i className="bi bi-chat-dots-fill" style={{ color: "var(--adm-info)", marginRight: 8 }} />
            Hỗ trợ trực tuyến (Real-time)
          </h1>
          <p className="adm-page-sub">Trò chuyện và hỗ trợ khách hàng, đối tác ngay lập tức</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-wrapper">
          <div className="chat-layout">
            {/* Sidebar */}
            <aside className="chat-sidebar">
              <div className="chat-header-admin">
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--adm-text)" }}>
                  <i className="bi bi-chat-text" style={{ color: "var(--adm-info)", marginRight: 8 }} />
                  Đoạn chat
                </div>
              </div>

              <div className="chat-user-list">
                {rooms.map((r, i) => {
                  const isGuest = r._id?.startsWith("support_guest");
                  return (
                    <div
                      key={r._id}
                      className={`chat-user-item ${activeRoom === r._id ? 'active' : ''}`}
                      onClick={() => setActiveRoom(r._id)}
                    >
                      <div className="chat-user-avatar" style={{ background: isGuest ? '#e2e8f0' : 'var(--adm-primary)' }}>
                        {isGuest ? 'G' : 'U'}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div className="chat-user-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: activeRoom === r._id ? 700 : 500 }}>
                          {r.customerName || r.senderName || r._id}
                          {isGuest && <span style={{ marginLeft: 5, fontSize: 10, background: '#cbd5e1', padding: '2px 5px', borderRadius: 4, fontWeight: 'normal', color: '#333' }}>Guest</span>}
                        </div>
                        <div className="chat-user-preview" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{r.lastMessage}</div>
                      </div>
                      <div className="chat-user-time" style={{ whiteSpace: 'nowrap' }}>{r.lastTime}</div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Chat area */}
            <main className="chat-main">
              <header className="chat-topbar">
                <div className="chat-partner">
                  <div className="chat-partner-avatar">CS</div>
                  <div>
                    <div className="chat-partner-name">
                      {rooms.find(r => r._id === activeRoom)?.customerName || rooms.find(r => r._id === activeRoom)?.senderName || activeRoom}
                    </div>
                    <div className="chat-partner-status">Đang trực tuyến</div>
                  </div>
                </div>
                <div className="chat-active">Trực tuyến</div>
              </header>

              <div ref={scrollRef} className="chat-messages">
                <div className="chat-system">Đã kết nối — {messages.length} tin nhắn</div>
                {messages.map((m) => (
                  <div key={m.id} className={`chat-bubble-row ${m.from === "admin" ? "me" : "them"}`}>
                    <div className={`chat-bubble ${m.from === "admin" ? "me" : "them"}`}>
                      <div>{m.text}</div>
                      <div className="chat-time">
                        {(() => {
                          const d = new Date(m.time);
                          return isNaN(d.getTime()) ? m.time : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-bar">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
                  className="chat-input"
                />
                <button onClick={sendMessage} className="chat-send-btn">
                  <i className="bi bi-send-fill" />
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
