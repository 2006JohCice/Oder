import { useState } from "react";

/**
 * Custom hook quản lý hiển thị AutoCloseNotification
 */
export default function useNotification() {
  const [visible, setVisible] = useState(false);
  const [notifKey, setNotifKey] = useState(0);
  const [message, setMessage] = useState("");

  const showNotification = (msg) => {
    setNotifKey((prev) => prev + 1); 
    setMessage(msg);
    setVisible(true);
  };

  const hideNotification = () => {
    setVisible(false);
  };

  return {
    visible,
    notifKey,
    message,
    showNotification,
    hideNotification,
  };
}
