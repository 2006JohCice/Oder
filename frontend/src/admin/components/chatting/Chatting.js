import React, { useState, useRef, useEffect } from "react";
import "../../css/shared/admin-components.css";
import "../../css/chatting/ChatUI.css";

function ChatUI() {
  const [messages, setMessages] = useState([
    { id: 1, from: "them", text: "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?", time: "09:30" },
    { id: 2, from: "me", text: "Mình muốn xem demo giao diện chat.", time: "09:31" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const newMsg = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, newMsg]);
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
            Hỗ trợ trực tuyến
          </h1>
          <p className="adm-page-sub">Trò chuyện và hỗ trợ khách hàng, đối tác</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-wrapper">
          <div className="chat-layout">
            {/* Sidebar */}
            <aside className="chat-sidebar">
              <div className="chat-header">
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--adm-text)" }}>
                  <i className="bi bi-chat-text" style={{ color: "var(--adm-info)", marginRight: 8 }} />
                  Đoạn chat
                </div>
              </div>

              <div className="chat-user-list">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="chat-user-item">
                    <div className="chat-user-avatar">U</div>
                    <div style={{ flex: 1 }}>
                      <div className="chat-user-name">User {i + 1}</div>
                      <div className="chat-user-preview">Tin nhắn mới nhất từ user này...</div>
                    </div>
                    <div className="chat-user-time">09:{10 + i}</div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Chat area */}
            <main className="chat-main">
              <header className="chat-topbar">
                <div className="chat-partner">
                  <div className="chat-partner-avatar">CS</div>
                  <div>
                    <div className="chat-partner-name">Customer Support</div>
                    <div className="chat-partner-status">Thường trả lời trong vài phút</div>
                  </div>
                </div>
                <div className="chat-active">Trực tuyến</div>
              </header>

              <div ref={scrollRef} className="chat-messages">
                <div className="chat-system">Đã kết nối — {messages.length} tin nhắn</div>
                {messages.map((m) => (
                  <div key={m.id} className={`chat-bubble-row ${m.from === "me" ? "me" : "them"}`}>
                    <div className={`chat-bubble ${m.from}`}>
                      <div>{m.text}</div>
                      <div className="chat-time">{m.time}</div>
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
