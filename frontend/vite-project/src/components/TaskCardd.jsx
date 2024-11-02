import React, { useEffect, useState } from "react";
import styles from "./TaskCardd.module.css"; // Adjust with your CSS styles
import menu from "../assets/menu.png"; // Import bin icon for delete button, if needed
import downArrow from "../assets/downArrow.png"; // Import your down arrow icon
import { useUser } from "../UserContext";
import axios from "axios";

const TaskCardd = ({
  task,
  onChangeStatus,
  handleShare,
  checklistOpen,
  setChecklistOpenColumns,
  columnName,
}) => {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setIsTaskModalOpen } = useUser();
  const { TaskToEdit, setTaskToEdit, refreshTasks, setrefreshTasks } =
    useUser();

  useEffect(() => {
    // Synchronize checklist state with `checklistOpen` prop

    setIsChecklistOpen(checklistOpen);
  }, [checklistOpen]);

  useEffect(() => {
    // Synchronize checklist state with `checklistOpen` prop
    console.log(isChecklistOpen, "isChecklist");
    console.log(checklistOpen, "checklistopen");
  }, [checklistOpen, isChecklistOpen]);

  const {
    title,
    priority,
    checklist = [],
    dueDate,
    assignTo,
    completedItems = [],
    status,
  } = task;
  const getDueDateStyle = () => {
    const isOverdue = new Date(dueDate) < new Date();
    if (status === "Done") {
      return styles.dueDateGreen; // Apply green when status is "Done"
    } else if (isOverdue) {
      return styles.overdue; // Apply red when overdue
    }
    return styles.dueDate; // Default due date style
  };
  const handleChecklistOpen = () => {
    setIsChecklistOpen((prev) => !prev);
    setChecklistOpenColumns((prev) => ({ ...prev, [columnName]: true }));
  };

  const onShare = (task) => {
    handleShare(task); // Pass task to Dashboard's handleShare function
    setIsMenuOpen(false);
  };

  const onDelete = async () => {
    try {
      console.log(task._id);
      await axios.delete(`http://localhost:8080/api/user/tasks/${task._id}`);
      setrefreshTasks((prev) => !prev); // Toggle to re-fetch tasks
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const onEdit = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true); // Open modal
    setIsMenuOpen(false);
  };

  // Function to get priority style
  const getPriorityStyle = () => {
    switch (priority) {
      case "High Priority":
        return styles.highPriority;
      case "Moderate Priority":
        return styles.moderatePriority;
      case "Low Priority":
        return styles.lowPriority;
      default:
        return "";
    }
  };

  // Function to get initials from the assigned person's name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className={`${styles.taskCard} ${getPriorityStyle()}`}>
      {/* Priority and initials */}
      <div className={styles.cardHeader}>
        <span className={styles.priorityText}>{priority}</span>
        {assignTo && (
          <span className={styles.initials}>{getInitials(assignTo)}</span>
        )}
      </div>

      {/* Task Title */}
      <h3 className={styles.title}>{title}</h3>

      {/* Checklist Progress */}
      <p className={styles.checklistProgress}>
        Checklist: {completedItems.length}/{checklist.length}
        <button
          className={styles.toggleChecklistButton}
          // onClick={() => setIsChecklistOpen((prev) => !prev)}
          onClick={handleChecklistOpen}
        >
          <img src={downArrow} alt="Toggle Checklist" />
        </button>
      </p>

      {/* Toggle Button for Checklist */}
      <button
        className={styles.toggleChecklistButton}
        // onClick={() => setIsChecklistOpen((prev) => !prev)}
        onClick={handleChecklistOpen}
      >
        <img src={downArrow} alt="Toggle Checklist" />
      </button>

      {/* Checklist Items */}
      {isChecklistOpen && (
        <ul className={styles.checklist}>
          {checklist.map((item, index) => (
            <li key={item._id || index} className={styles.checklistItem}>
              {item.item}{" "}
              {/* Render the item property from the checklist object */}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.bottom}>
        <div className={styles.date}>Due Date</div>
        {/* Due Date */}
        {dueDate && (
          <p className={getDueDateStyle()}>
            {" "}
            {new Date(dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        )}

        {/* Task Status Badges */}
      </div>
    </div>
  );
};

export default TaskCardd;
