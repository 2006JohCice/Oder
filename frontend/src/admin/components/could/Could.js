/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import React, { useState } from "react";
import Loading from "../../helpers/loading";
import "../../css/could/could.css";

function Cloud() {
  const [isLoaded, setIsLoaded] = useState(true);
  const [tasks, setTasks] = useState({}); 
  const [notes, setNotes] = useState({}); 

  const days = [
    { key: "mon", label: "ThÃ¡Â»Â© 2" },
    { key: "tue", label: "ThÃ¡Â»Â© 3" },
    { key: "wed", label: "ThÃ¡Â»Â© 4" },
    { key: "thu", label: "ThÃ¡Â»Â© 5" },
    { key: "fri", label: "ThÃ¡Â»Â© 6" },
    { key: "sat", label: "ThÃ¡Â»Â© 7" },
    { key: "sun", label: "ChÃ¡Â»Â§ nhÃ¡ÂºÂ­t" },
  ];

  const today = new Date();

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
  };
  const monday = getMonday(today);

  const pad = (n) => String(n).padStart(2, "0");

  const getWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  };

  const getDayKey = (date) => {
    const map = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    return map[date.getDay()];
  };

  const handleAddTask = (key) => {
    const text = notes[key];
    if (!text || !text.trim()) return;

    setTasks((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), text.trim()],
    }));

    setNotes((prev) => ({ ...prev, [key]: "" })); 
  };

  const handleChangeNote = (key, value) => {
    setNotes((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {!isLoaded ? (
        <div className="admin-page-title">
          <Loading message="Admin Ã„â€˜ang lÃƒÂªn lÃ¡Â»â€¹ch lÃƒÂ m viÃ¡Â»â€¡c, vui lÃƒÂ²ng quay lÃ¡ÂºÂ¡i sau..." />
        </div>
      ) : (
        <div className="cloud-container">
          <div className="cloud-wrapper">
            <main>
              <div className="cloud-days">
                {/* TÃ¡Â»â€¢ng quan tuÃ¡ÂºÂ§n */}
                <div className="cloud-summary">
                  <h2>TÃ¡Â»â€¢ng quan tuÃ¡ÂºÂ§n</h2>
                  <div className="cloud-summary-stats">
                    <div className="cloud-summary-item">
                      <div className="label">HÃƒÂ´m nay</div>
                      <div className="value">
                        {`${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`}
                      </div>
                    </div>
                    <div className="cloud-summary-item">
                      <div className="label">TuÃ¡ÂºÂ§n</div>
                      <div className="value">{`TuÃ¡ÂºÂ§n ${getWeekNumber(today)}`}</div>
                    </div>
                    <div className="cloud-summary-item">
                      <div className="label">NÃ„Æ’m</div>
                      <div className="value">{today.getFullYear()}</div>
                    </div>
                  </div>
                </div>

                {/* Danh sÃƒÂ¡ch cÃƒÂ¡c ngÃƒÂ y */}
                {days.map((d, i) => {
                  const date = new Date(monday);
                  date.setDate(monday.getDate() + i);
                  const day = pad(date.getDate());
                  const month = pad(date.getMonth() + 1);
                  const year = date.getFullYear();

                  return (
                    <div key={d.key} className="cloud-day">
                      <div className="cloud-day-header">
                        <h3>{d.label}</h3>
                        <div className="today">
                          {d.key === getDayKey(today) ? "HÃƒÂ´m nay" : ""}
                        </div>
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th>NgÃƒÂ y</th>
                            <th>ThÃƒÂ¡ng</th>
                            <th>NÃ„Æ’m</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{day}</td>
                            <td>{month}</td>
                            <td>{year}</td>
                          </tr>
                        </tbody>
                      </table>

                      <hr className="divider" />

                      <textarea
                        placeholder="Ghi chÃƒÂº cÃƒÂ´ng viÃ¡Â»â€¡c..."
                        className="cloud-note"
                        value={notes[d.key] || ""}
                        onChange={(e) => handleChangeNote(d.key, e.target.value)}
                      />

                      <div className="cloud-day-footer">
                        <button className="admin-btn" onClick={() => handleAddTask(d.key)}>
                          ThÃƒÂªm
                        </button>
                        <div className="cloud-task-count">
                          {(tasks[d.key]?.length || 0)} nhiÃ¡Â»â€¡m vÃ¡Â»Â¥
                        </div>
                      </div>

                      {/* Danh sÃƒÂ¡ch nhiÃ¡Â»â€¡m vÃ¡Â»Â¥ */}
                      {tasks[d.key]?.map((t, idx) => (
                        <div key={idx} className="cloud-task">
                          {idx + 1}. {t}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}

export default Cloud;
