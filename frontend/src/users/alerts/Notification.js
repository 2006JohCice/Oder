import React, { useState, useEffect } from "react";
// import "../../css/alerts/AutoCloseNotification.css";

function Notification({ message, onClose }) {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState("show");

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setFade("hide");
        setTimeout(() => {
          setShow(false);
          if (onClose) onClose();
        }, 500);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`alert alert-success ${fade}`} role="alert" style={{position: "fixed",  right: "20px" , zIndex: "9999"}}>
       <span>{message}</span>
    </div>
  );
}

export default Notification;
