import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import styles from "./AddTaskModal.module.css";
import bin from "../assets/bin.png";
import { useUser } from "../UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  peopleList,
  filterTasksByTimePeriod,
  selectedPeriod,
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("High Priority");
  const [checklistItems, setChecklistItems] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [assignTo, setAssignTo] = useState("");

  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    TaskToEdit,
    setTaskToEdit,
    mail,
    setrefreshTasks,
  } = useUser();

  useEffect(() => {
    if (isTaskModalOpen && TaskToEdit) {
      // Set pre-filled data from `taskToEdit`
      setTitle(TaskToEdit.title || "");
      setPriority(TaskToEdit.priority || "High Priority");
      setChecklistItems(TaskToEdit.checklist || []);
      setDueDate(TaskToEdit.dueDate ? new Date(TaskToEdit.dueDate) : null);
      setCompletedItems(
        TaskToEdit.checklist.filter((item) => item.isCompleted).map((_, i) => i)
      );
      setAssignTo(TaskToEdit.assignTo || "");
    }
  }, [isTaskModalOpen, TaskToEdit]);

  const handleAddChecklistItem = () =>
    setChecklistItems([...checklistItems, { item: "", isCompleted: false }]);

  const handleDeleteChecklistItem = (index) => {
    const newChecklist = checklistItems.filter((_, i) => i !== index);
    setChecklistItems(newChecklist);
  };

  const toggleCompletion = (index) => {
    const isCompleted = completedItems.includes(index);
    setCompletedItems(
      isCompleted
        ? completedItems.filter((i) => i !== index)
        : [...completedItems, index]
    );
  };

  const handleCancel = () => {
    onClose();
    resetFields();
  };

  const handleSave = async () => {
    const taskData = {
      title,
      priority,
      checklist: checklistItems.map((item, index) => ({
        item: item.item ? String(item.item) : "", // Convert item to a string
        isCompleted: !!completedItems.includes(index), // Convert completion to a Boolean
      })),
      dueDate,
      assignTo,
      postedBy: mail,
    };

    try {
      const url = TaskToEdit
        ? `https://task-manager-0yqb.onrender.com/api/user/edit/${TaskToEdit._id}` // Update task if TaskToEdit exists
        : "https://task-manager-0yqb.onrender.com/api/user/save"; // Create new task otherwise

      const response = await fetch(url, {
        method: TaskToEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error in saving task:", errorData);
        alert("Failed to save task. See console for details.");
        return;
      }

      if (response.ok) {
        setrefreshTasks((prev) => !prev); // Only set if save is successful
        onSave(taskData);
        onClose();
        resetFields();
        setrefreshTasks((prev) => !prev);
        console.log("Task saved");
        filterTasksByTimePeriod(selectedPeriod);
        toast.success("Signed up successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      // onSave(taskData); // Pass updated task to parent component
      // onClose();
      // resetFields();
    } catch (error) {
      console.error("Network or server error:", error);
      alert("Network error: Could not save task.");
    }
  };

  const resetFields = () => {
    setTitle("");
    setPriority("High Priority");
    setChecklistItems([]);
    setDueDate(null);
    setCompletedItems([]);
    setAssignTo("");
    setTaskToEdit(null);
  };

  if (!isTaskModalOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <ToastContainer />
      <div className={styles.modalContent}>
        <label className={styles.label}>Title *</label>
        <input
          type="text"
          placeholder="Enter Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.inputtitle}
        />

        <label className={styles.label}>Select Priority *</label>
        <div className={styles.priorityGroup}>
          <button
            className={`${styles.priorityButton} ${
              priority === "High Priority" && styles.active
            }`}
            onClick={() => setPriority("High Priority")}
          >
            🔴 High Priority
          </button>
          <button
            className={`${styles.priorityButton2} ${
              priority === "Moderate Priority" && styles.active
            }`}
            onClick={() => setPriority("Moderate Priority")}
          >
            🔵 Moderate Priority
          </button>
          <button
            className={`${styles.priorityButton} ${
              priority === "Low Priority" && styles.active
            }`}
            onClick={() => setPriority("Low Priority")}
          >
            🟢 Low Priority
          </button>
        </div>

        <label className={styles.label}>Assign To *</label>
        <select
          className={styles.input}
          value={assignTo}
          onChange={(e) => setAssignTo(e.target.value)}
        >
          <option value="">Select an email</option>
          {peopleList.map((person, index) => (
            <option key={index} value={person}>
              {person}
            </option>
          ))}
        </select>

        <label className={styles.label}>
          Checklist ({completedItems.length}/{checklistItems.length}) *
        </label>
        <div className={styles.checklist}>
          {checklistItems.map((item, index) => (
            <div key={index} className={styles.checklistItem}>
              <label className={styles.customCheckbox}>
                <input
                  type="checkbox"
                  checked={completedItems.includes(index)}
                  onChange={() => toggleCompletion(index)}
                  className={styles.hiddenCheckbox}
                />
                <span className={styles.checkboxCustom}></span>
              </label>
              <input
                type="text"
                placeholder={`Checklist Item ${index + 1}`}
                value={item.item}
                onChange={(e) => {
                  const newChecklist = [...checklistItems];
                  newChecklist[index] = {
                    ...newChecklist[index],
                    item: e.target.value, // Update the `item` field correctly
                  };
                  setChecklistItems(newChecklist);
                }}
                className={styles.input}
              />

              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteChecklistItem(index)}
              >
                <img src={bin} alt="Delete" className={styles.binIcon} />
              </button>
            </div>
          ))}

          <button
            className={styles.addNewButton}
            onClick={handleAddChecklistItem}
          >
            +Add New
          </button>
        </div>

        <div className={styles.dueDatePicker}>
          {/* <label className={styles.label}>Select Due Date</label> */}
          <div className={styles.datePickerContainer}>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select due date"
              className={styles.dueDateInput}
            />
            <FaCalendarAlt className={styles.calendarIcon} />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
