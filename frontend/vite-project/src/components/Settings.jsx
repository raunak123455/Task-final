import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css"; // Ensure this path is correct
import { useUser } from "../UserContext"; // Import context to get user data and update functions

const Settings = () => {
  const { userObject, setUserObject, setrefreshTasks, user, updateUser } =
    useUser(); // Access current user data
  const [formData, setFormData] = useState({
    name: userObject.name || "",
    email: userObject.email || "",
    oldPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Starting form submission"); // Add this line
    console.log("Form data:", formData); // Log the data to verify it's correct
    try {
      const response = await fetch("https://task-manager-0yqb.onrender.com/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userObject.id,
          ...formData,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log("Request successful:", result); // Check if the request succeeded
        setUserObject((prev) => ({
          ...prev,
          name: formData.name,
          email: formData.email,
        }));
        setMessage("User updated successfully!");
        setUserObject(result.user);
        console.log(result.user.name);
        updateUser(result.user.name);
        setrefreshTasks((prev) => !prev);
      } else {
        console.log("Request failed:", result); // Log failure details
        setError(result.message || "Update failed. Please try again.");
      }
    } catch (err) {
      console.error("Error making request:", err); // Log unexpected errors
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className={styles.settings}>
      <h2 className={styles.settingh2}>Settings</h2>
      <form className={styles.settingsForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">
            <i className="icon-user"></i>
          </label>
          <input
            type="text"
            id="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">
            <i className="icon-mail"></i>
          </label>
          <input
            type="email"
            id="email"
            placeholder="Update Email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="oldPassword">
            <i className="icon-lock"></i>
          </label>
          <input
            type="password"
            id="oldPassword"
            placeholder="Old Password"
            value={formData.oldPassword}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword">
            <i className="icon-lock"></i>
          </label>
          <input
            type="password"
            id="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className={styles.updateButton}>
          Update
        </button>
        {message && <p className={styles.successText}>{message}</p>}
        {error && <p className={styles.errorText}>{error}</p>}
      </form>
    </div>
  );
};

export default Settings;
