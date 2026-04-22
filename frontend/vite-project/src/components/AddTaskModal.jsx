import { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt,
  FaMagic,
  FaRobot,
  FaLightbulb,
  FaChartLine,
} from "react-icons/fa";
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

  // AI states
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiDateSuggestion, setAiDateSuggestion] = useState(null);
  const [aiChecklistSuggestions, setAiChecklistSuggestions] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiWorkloadInsight, setAiWorkloadInsight] = useState("");
  const [dotCount, setDotCount] = useState(0);

  const analyzeTimeoutRef = useRef(null);

  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    TaskToEdit,
    setTaskToEdit,
    mail,
    setrefreshTasks,
  } = useUser();

  // Animate dots for "Analyzing..."
  useEffect(() => {
    if (!aiAnalyzing) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [aiAnalyzing]);

  useEffect(() => {
    if (isTaskModalOpen && TaskToEdit) {
      setTitle(TaskToEdit.title || "");
      setPriority(TaskToEdit.priority || "High Priority");
      setChecklistItems(TaskToEdit.checklist || []);
      setDueDate(TaskToEdit.dueDate ? new Date(TaskToEdit.dueDate) : null);
      setCompletedItems(
        TaskToEdit.checklist
          .filter((item) => item.isCompleted)
          .map((_, i) => i),
      );
      setAssignTo(TaskToEdit.assignTo || "");
    }
  }, [isTaskModalOpen, TaskToEdit]);

  // AI Analysis effect
  useEffect(() => {
    if (TaskToEdit) {
      setShowAiPanel(false);
      setAiInsights(null);
      setAiDateSuggestion(null);
      setAiChecklistSuggestions([]);
      return;
    }

    if (title.trim().length < 3) {
      setShowAiPanel(false);
      setAiInsights(null);
      setAiDateSuggestion(null);
      setAiChecklistSuggestions([]);
      return;
    }

    setAiAnalyzing(true);
    setShowAiPanel(true);

    if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);

    analyzeTimeoutRef.current = setTimeout(() => {
      const analysis = runMockAiAnalysis(title);
      setAiInsights(analysis);

      const suggestedDate = new Date();
      suggestedDate.setDate(suggestedDate.getDate() + analysis.dueDays);
      setAiDateSuggestion(suggestedDate);

      setAiChecklistSuggestions(analysis.checklist);
      setAiAnalyzing(false);
    }, 1200);

    return () => {
      if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
    };
  }, [title, TaskToEdit]);

  // AI Workload insight when assignee changes
  useEffect(() => {
    if (!assignTo) {
      setAiWorkloadInsight("");
      return;
    }
    const mockWorkload = generateMockWorkload(assignTo);
    setAiWorkloadInsight(mockWorkload);
  }, [assignTo]);

  const runMockAiAnalysis = (taskTitle) => {
    const lower = taskTitle.toLowerCase();
    let complexity = "Low";
    let suggestedPriority = "Low Priority";
    let estimatedHours = 2;
    let dueDays = 5;
    let checklist = [];
    let insightText = "";

    if (
      lower.includes("urgent") ||
      lower.includes("asap") ||
      lower.includes("critical") ||
      lower.includes("bug") ||
      lower.includes("fix") ||
      lower.includes("issue")
    ) {
      complexity = "High";
      suggestedPriority = "High Priority";
      estimatedHours = 8;
      dueDays = 1;
      checklist = [
        "Assess urgency and impact",
        "Notify relevant stakeholders",
        "Execute immediate fix",
        "Verify resolution and close",
      ];
      insightText =
        "Urgent tasks like this are typically resolved within 8 hours based on your history.";
    } else if (
      lower.includes("meeting") ||
      lower.includes("call") ||
      lower.includes("discuss") ||
      lower.includes("sync")
    ) {
      complexity = "Low";
      suggestedPriority = "Moderate Priority";
      estimatedHours = 1;
      dueDays = 2;
      checklist = [
        "Prepare agenda and objectives",
        "Send calendar invites",
        "Set up venue or meeting link",
        "Share notes and action items post-meeting",
      ];
      insightText =
        "Meetings are usually scheduled within 2 days. Morning slots have 90% acceptance rate.";
    } else if (
      lower.includes("report") ||
      lower.includes("review") ||
      lower.includes("analysis") ||
      lower.includes("summary")
    ) {
      complexity = "Moderate";
      suggestedPriority = "Moderate Priority";
      estimatedHours = 6;
      dueDays = 4;
      checklist = [
        "Gather required data and sources",
        "Draft initial report structure",
        "Review findings for accuracy",
        "Finalize formatting and submit",
      ];
      insightText =
        "Reports of this nature take an average of 6 hours. You complete 85% within the deadline.";
    } else if (
      lower.includes("design") ||
      lower.includes("ui") ||
      lower.includes("ux") ||
      lower.includes("mockup")
    ) {
      complexity = "Moderate";
      suggestedPriority = "Moderate Priority";
      estimatedHours = 5;
      dueDays = 3;
      checklist = [
        "Research design references",
        "Create low-fidelity wireframes",
        "Design high-fidelity screens",
        "Gather feedback and iterate",
      ];
      insightText =
        "Design tasks have a 40% revision rate. Allocating buffer time is recommended.";
    } else if (
      lower.includes("deploy") ||
      lower.includes("release") ||
      lower.includes("launch") ||
      lower.includes("ship")
    ) {
      complexity = "High";
      suggestedPriority = "High Priority";
      estimatedHours = 4;
      dueDays = 2;
      checklist = [
        "Run final regression tests",
        "Prepare release notes",
        "Deploy to production environment",
        "Monitor metrics and rollback plan",
      ];
      insightText = "Deployments scheduled mid-week have 25% fewer rollbacks.";
    } else if (
      lower.includes("test") ||
      lower.includes("qa") ||
      lower.includes("validate")
    ) {
      complexity = "Moderate";
      suggestedPriority = "Moderate Priority";
      estimatedHours = 4;
      dueDays = 3;
      checklist = [
        "Write test cases and scenarios",
        "Execute manual/automated tests",
        "Log bugs and issues found",
        "Retest after fixes and sign off",
      ];
      insightText =
        "Testing tasks with defined cases are completed 30% faster.";
    } else {
      complexity = "Low";
      suggestedPriority = "Low Priority";
      estimatedHours = 3;
      dueDays = 5;
      checklist = [
        "Define scope and requirements",
        "Break down into sub-tasks",
        "Execute main deliverable",
        "Review and mark complete",
      ];
      insightText =
        "General tasks are typically completed in 3 hours based on your average.";
    }

    if (taskTitle.length > 40) {
      estimatedHours += 2;
      dueDays += 1;
      complexity = complexity === "Low" ? "Moderate" : "High";
    }

    if (checklistItems.length > 3) {
      estimatedHours += 1;
    }

    return {
      complexity,
      suggestedPriority,
      estimatedHours,
      dueDays,
      checklist,
      insightText,
    };
  };

  const generateMockWorkload = (personEmail) => {
    const seed = personEmail.length + personEmail.charCodeAt(0);
    const activeTasks = (seed % 5) + 1;
    const loadLevel =
      activeTasks > 3 ? "high" : activeTasks > 1 ? "moderate" : "light";
    const colors = { high: "#e74c3c", moderate: "#f39c12", light: "#27ae60" };
    const texts = {
      high: `${activeTasks} active tasks this week — workload is high. Consider delegating sub-tasks.`,
      moderate: `${activeTasks} active tasks this week — balanced workload. Good time to assign.`,
      light: `${activeTasks} active task this week — light workload. Ideal for new assignments.`,
    };
    return { text: texts[loadLevel], color: colors[loadLevel], activeTasks };
  };

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
        : [...completedItems, index],
    );
  };

  const applyAiDate = () => {
    if (aiDateSuggestion) {
      setDueDate(aiDateSuggestion);
      toast.success("AI due date applied!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const applyAiPriority = () => {
    if (aiInsights) {
      setPriority(aiInsights.suggestedPriority);
      toast.success(`AI set priority to ${aiInsights.suggestedPriority}!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const addAiChecklistItem = (itemText) => {
    setChecklistItems((prev) => [
      ...prev,
      { item: itemText, isCompleted: false },
    ]);
  };

  const addAllAiChecklistItems = () => {
    const newItems = aiChecklistSuggestions.map((text) => ({
      item: text,
      isCompleted: false,
    }));
    setChecklistItems((prev) => [...prev, ...newItems]);
    setAiChecklistSuggestions([]);
    toast.success("AI checklist items added!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
    });
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
        item: item.item ? String(item.item) : "",
        isCompleted: !!completedItems.includes(index),
      })),
      dueDate,
      assignTo,
      postedBy: mail,
    };

    try {
      const url = TaskToEdit
        ? `https://task-manager-tkx6.onrender.com/api/user/edit/${TaskToEdit._id}`
        : "https://task-manager-tkx6.onrender.com/api/user/save";

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
        setrefreshTasks((prev) => !prev);
        onSave(taskData);
        onClose();
        resetFields();
        setrefreshTasks((prev) => !prev);
        console.log("Task saved");
        filterTasksByTimePeriod(selectedPeriod);
        toast.success("Task saved successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
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
    setAiAnalyzing(false);
    setAiInsights(null);
    setAiDateSuggestion(null);
    setAiChecklistSuggestions([]);
    setShowAiPanel(false);
    setAiWorkloadInsight("");
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

        {/* AI Task Analyzer */}
        {showAiPanel && !TaskToEdit && (
          <div className={styles.aiPanel}>
            <div className={styles.aiHeader}>
              <FaRobot className={styles.aiIcon} />
              <span className={styles.aiTitle}>AI Task Analyzer</span>
            </div>
            {aiAnalyzing ? (
              <div className={styles.aiAnalyzing}>
                <div className={styles.aiSpinner}></div>
                <span>Analyzing task title{".".repeat(dotCount)}</span>
              </div>
            ) : aiInsights ? (
              <div className={styles.aiResults}>
                <div className={styles.aiBadges}>
                  <span
                    className={`${styles.aiBadge} ${
                      aiInsights.complexity === "High"
                        ? styles.badgeHigh
                        : aiInsights.complexity === "Moderate"
                        ? styles.badgeModerate
                        : styles.badgeLow
                    }`}
                  >
                    <FaChartLine /> Complexity: {aiInsights.complexity}
                  </span>
                  <span className={styles.aiBadge}>
                    <FaLightbulb /> Est. Time: {aiInsights.estimatedHours}h
                  </span>
                </div>
                <p className={styles.aiInsightText}>{aiInsights.insightText}</p>
                <button className={styles.aiApplyBtn} onClick={applyAiPriority}>
                  <FaMagic /> Apply Suggested Priority (
                  {aiInsights.suggestedPriority})
                </button>
              </div>
            ) : null}
          </div>
        )}

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

        {/* AI Workload Insight */}
        {aiWorkloadInsight && (
          <div
            className={styles.aiWorkloadCard}
            style={{ borderLeftColor: aiWorkloadInsight.color }}
          >
            <FaRobot className={styles.aiWorkloadIcon} />
            <div>
              <span className={styles.aiWorkloadLabel}>
                AI Workload Insight
              </span>
              <p className={styles.aiWorkloadText}>{aiWorkloadInsight.text}</p>
            </div>
          </div>
        )}

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
                    item: e.target.value,
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

        {/* AI Checklist Suggestions */}
        {aiChecklistSuggestions.length > 0 && !TaskToEdit && (
          <div className={styles.aiChecklistPanel}>
            <div className={styles.aiChecklistHeader}>
              <FaMagic className={styles.aiChecklistIcon} />
              <span>AI Suggested Checklist</span>
            </div>
            <div className={styles.aiChecklistItems}>
              {aiChecklistSuggestions.map((suggestion, idx) => (
                <div key={idx} className={styles.aiChecklistChip}>
                  <span>{suggestion}</span>
                  <button
                    className={styles.aiChipAddBtn}
                    onClick={() => addAiChecklistItem(suggestion)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
            <button
              className={styles.aiAddAllBtn}
              onClick={addAllAiChecklistItems}
            >
              Add All Suggestions
            </button>
          </div>
        )}

        <div className={styles.dueDatePicker}>
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

        {/* AI Date Suggestion */}
        {aiDateSuggestion && !TaskToEdit && (
          <div className={styles.aiDateSuggestion}>
            <FaMagic className={styles.aiDateIcon} />
            <div className={styles.aiDateInfo}>
              <span className={styles.aiDateLabel}>AI Smart Due Date</span>
              <span className={styles.aiDateValue}>
                {aiDateSuggestion.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className={styles.aiDateReason}>
                Based on task complexity ({aiInsights?.complexity}) and your
                past completion trends
              </span>
            </div>
            <button className={styles.aiDateApplyBtn} onClick={applyAiDate}>
              Apply
            </button>
          </div>
        )}

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
