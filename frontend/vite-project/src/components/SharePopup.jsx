// SharePopup.jsx
import React, { useEffect } from "react";
import styles from "./SharePopup.module.css";

const SharePopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000); // Auto-close after 2 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.popup}>
      <p>{message}</p>
    </div>
  );
};

export default SharePopup;
