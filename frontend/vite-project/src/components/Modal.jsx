import React, { useState } from "react";
import styles from "./Dashboard.module.css";

const Modal = ({ isOpen, onClose, onAdd }) => {
  const [email, setEmail] = useState("");
  const [Adding, setAdding] = useState(true);

  if (!isOpen) return null;

  const handleAdd = () => {
    onAdd(email);

    // setEmail(""); // Clear the input field after adding
    setAdding(false); // Close the modal after adding
  };

  const handleClose = () => {
    setEmail("");
    setAdding(true);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {Adding ? (
          <>
            {" "}
            <h3>Add people to the board</h3>
            <input
              type="email"
              placeholder="Enter the email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button onClick={onClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleAdd} className={styles.addButton}>
                Add Email
              </button>
            </div>{" "}
          </>
        ) : (
          <div>
            <h2 className={styles.added}> {email} has been added</h2>

            <button onClick={handleClose} className={styles.addButton}>
              Ok Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
