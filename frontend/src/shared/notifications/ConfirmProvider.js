import { createContext, useContext, useEffect, useState } from "react";
import "./ConfirmProvider.css";

const ConfirmContext = createContext({
  confirmApp: () => Promise.resolve(true),
});

// A global event emitter for the confirm dialog
export const confirmApp = (title, message = "") => {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent("app:confirm", {
        detail: { title, message, resolve },
      })
    );
  });
};

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    resolve: null,
  });

  useEffect(() => {
    const listener = (event) => {
      const { title, message, resolve } = event.detail;
      setConfirmState({
        isOpen: true,
        title,
        message,
        resolve,
      });
    };

    window.addEventListener("app:confirm", listener);
    return () => window.removeEventListener("app:confirm", listener);
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    closeModal();
  };

  const handleCancel = () => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    closeModal();
  };

  const closeModal = () => {
    setConfirmState({
      isOpen: false,
      title: "",
      message: "",
      resolve: null,
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirmApp }}>
      {children}
      {confirmState.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <h3>{confirmState.title}</h3>
            </div>
            {confirmState.message && (
              <div className="confirm-modal-body">
                <p>{confirmState.message}</p>
              </div>
            )}
            <div className="confirm-modal-footer">
              <button className="confirm-btn-cancel" onClick={handleCancel}>
                Hủy
              </button>
              <button className="confirm-btn-ok" onClick={handleConfirm}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
