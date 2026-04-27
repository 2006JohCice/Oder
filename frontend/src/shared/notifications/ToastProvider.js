import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ToastContext = createContext({ notify: () => {} });

export const notifyApp = (message, type = "info") => {
  if (!message) return;
  window.dispatchEvent(
    new CustomEvent("app:notify", {
      detail: { message, type },
    })
  );
};

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (event) => {
      const detail = event.detail || {};
      const nextToast = {
        id: `${Date.now()}-${Math.random()}`,
        type: detail.type || "info",
        message: detail.message,
      };
      setToasts((prev) => [...prev, nextToast]);
    };

    const previousAlert = window.alert;
    window.alert = (message) => {
      listener({ detail: { message, type: "info" } });
    };

    window.addEventListener("app:notify", listener);
    return () => {
      window.removeEventListener("app:notify", listener);
      window.alert = previousAlert;
    };
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return undefined;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3200)
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  const value = useMemo(
    () => ({
      notify: (message, type = "info") => notifyApp(message, type),
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="app-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`app-toast app-toast-${toast.type}`}>
            <i
              className={
                toast.type === "success"
                  ? "bi bi-check2-circle"
                  : toast.type === "error"
                  ? "bi bi-x-circle"
                  : "bi bi-info-circle"
              }
            />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
