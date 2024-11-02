import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { useUser } from "../UserContext"; // Assuming correct path for context
import logo from "../assets/logo.png";
import logout from "../assets/Logout.png";
import People from "../assets/People.png";
import remove from "../assets/remove.png";
import deleteimg from "../assets/delete.png";
import axios from "axios";
import TaskModal from "./AddTaskModal";
import TaskCard from "./TaskCard";
import Analytics from "./Analytics";
import Settings from "./Settings";
import SharePopup from "./SharePopup";
import { useNavigate } from "react-router-dom";

// Modal component
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
            <h2 className={styles.added}> {email} has been added}</h2>

            <button onClick={handleClose} className={styles.addButton}>
              Ok Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loggedIn, setLoggedIn } = useUser(); // Get user and loggedIn state
  const { setUserObject, userObject } = useUser();
  // const userId = userObject.id;
  const [userId, setUserId] = useState(null);

  const { isTaskModalOpen, setIsTaskModalOpen } = useUser();
  const [activePage, setActivePage] = useState("Board");
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal open state
  const [peopleList, setPeopleList] = useState([]);
  const [isPeopleListUpdated, setIsPeopleListUpdated] = useState(false);
  const [tasks, setTasks] = useState([]); // State to store filtered "To Do" tasks
  const { mail, TaskToEdit, refreshTasks, setrefreshTasks } = useUser();
  const [timePeriod, setTimePeriod] = useState("This week"); // State for selected time period
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("thisWeek");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const navigate = useNavigate();

  const [checklistOpenColumns, setChecklistOpenColumns] = useState({
    backlog: false,
    toDo: false,
    inProgress: false,
    done: false,
  });

  useEffect(() => {
    if (!loggedIn) {
      // Redirect to login if not logged in
      navigate("/");
    } else if (userObject) {
      setUserId(userObject.id);
      console.log(userId);
    }
  }, [loggedIn, userObject, navigate]);

  useEffect(() => {
    const fetchPeopleList = async () => {
      try {
        console.log(userId);
        const response = await fetch(
          `http://localhost:8080/api/user/${userId}/people-list`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        setPeopleList(data);
        console.log([peopleList]);
        setIsPeopleListUpdated(false);
      } catch (error) {
        console.error("Error fetching people list:", error);
        console.log(error);
      }
    };

    fetchPeopleList();
  }, [userId, isPeopleListUpdated]);

  useEffect(() => {
    // Define an asynchronous function to fetch tasks
    const fetchTasks = async () => {
      console.log(mail);
      try {
        const response = await fetch(`
          http://localhost:8080/api/user/tasks-posted/${mail}`);

        if (!response.ok) {
          throw new Error("Failed to fetch tasks.");
        }

        const data = await response.json();
        setTasks(data); // Set fetched tasks in state
        console.log(tasks);
      } catch (err) {
        console.log(err); // Handle any errors
      }
    };

    // Only fetch if email is provided
    if (mail) {
      fetchTasks();
    }
  }, [mail, TaskToEdit, refreshTasks]);

  const closeChecklistsInColumn = (columnName) => {
    setChecklistOpenColumns((prev) => ({ ...prev, [columnName]: false }));
    console.log(checklistOpenColumns);
  };

  // const closeChecklistsInColumn = (columnName) => {
  //   setChecklistOpenColumns((prev) => ({
  //     ...prev,
  //     [columnName]: !prev[columnName],
  //   }));
  //   console.log(checklistOpenColumns);
  // };

  useEffect(() => {
    console.log(checklistOpenColumns);
  }, [checklistOpenColumns]);

  const handleShare = (task) => {
    const taskLink = `${window.location.origin}/tasks/${task._id}`;
    navigator.clipboard.writeText(taskLink);
    setIsPopupVisible(true); // Show popup when link is copied
  };

  // const filterTasksByTimePeriod = (tasks) => {
  //   const now = new Date();
  //   return tasks.filter((task) => {
  //     const dueDate = new Date(task.dueDate);
  //     if (timePeriod === "This week") {
  //       const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  //       const endOfWeek = new Date(startOfWeek);
  //       endOfWeek.setDate(startOfWeek.getDate() + 6);
  //       return dueDate >= startOfWeek && dueDate <= endOfWeek;
  //     } else if (timePeriod === "This month") {
  //       return (
  //         dueDate.getMonth() === now.getMonth() &&
  //         dueDate.getFullYear() === now.getFullYear()
  //       );
  //     } else if (timePeriod === "This year") {
  //       return dueDate.getFullYear() === now.getFullYear();
  //     }
  //     return true;
  //   });
  // };

  // const filteredTasks = filterTasksByTimePeriod(tasks);

  const filterTasksByTimePeriod = async (period) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/user/filtertasks`,
        {
          params: { period },
        }
      );
      console.log(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error("Error fetching filtered tasks:", error);
    }
  };

  // const filteredTasks = filterTasksByTimePeriod(selectedPeriod);

  // Fetch tasks when component mounts or period changes
  useEffect(() => {
    filterTasksByTimePeriod(selectedPeriod);
    console.log(selectedPeriod);
  }, [selectedPeriod, refreshTasks]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // State to track which page is active (Board or Analytics)
  // Store the list of added people

  const handleAddPeople = async (email) => {
    console.log(userObject.id);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/add-people",
        { userId: userObject.id, email }
      );
      setIsPeopleListUpdated((prev) => !prev);
    } catch (error) {
      console.error("Failed to add email:", error);
    }
  };

  const handleSaveTask = (taskData) => {
    console.log("New Task Data:", taskData);
    // Handle saving the task data to the backend or state
  };

  // Conditionally render dashboard only if loggedIn is true
  if (!loggedIn) {
    return <div>You are not logged in.</div>; // Show a message if the user is not logged in
  }

  const handleLogout = () => {
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("userObject");

    // Reset state in your context (if using React Context)
    setLoggedIn(false);
    setUserObject(null);

    // Optional: Redirect to login or home page
  };

  const handleChangeStatus = async (taskId, newStatus) => {
    // Update the specific task's status without affecting others

    try {
      // Make API request to update the task status
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      console.log(newStatus, "changed baby");
      const response = await axios.put(
        `http://localhost:8080/api/user/task/${taskId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.status === 200) {
        // Refresh tasks or update the state to reflect changes
        setrefreshTasks((prev) => !prev);
        console.log("Task status updated successfully:", response.data);
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const backlogTasks = filteredTasks.filter(
    (task) => task.status === "Backlog"
  );
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "In Progress"
  );
  const doneTasks = filteredTasks.filter((task) => task.status === "Done");

  const backlogCount = backlogTasks.length;
  const todoCount = filteredTasks.filter(
    (task) =>
      task.status === "To Do" ||
      task.status === "In Progress" ||
      task.status === "Backlog"
  ).length;
  const inProgressCount = inProgressTasks.length;
  const completedCount = doneTasks.length;

  // const lowPriorityCount = tasks.filter(
  //   (task) => task.priority === "Low Priority"
  // ).length;
  // const moderatePriorityCount = tasks.filter(
  //   (task) => task.priority === "Moderate Priority"
  // ).length;
  // const highPriorityCount = tasks.filter(
  //   (task) => task.priority === "High Priority"
  // ).length;
  // const dueDateCount = tasks.filter(
  //   (task) => task.dueDate && new Date(task.dueDate) < new Date()
  // ).length;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src={logo} alt="" />
          <h2 className={styles.iteem}>Pro Manage</h2>
        </div>

        <nav className={styles.nav}>
          <a
            href="#"
            className={`${styles.navItem} ${
              activePage === "Board" ? styles.active : ""
            }`}
            onClick={() => setActivePage("Board")}
          >
            <h2 className={styles.iteem}>Board</h2>
          </a>
          <a
            href="#"
            className={`${styles.navItem} ${
              activePage === "Analytics" ? styles.active : ""
            }`}
            onClick={() => setActivePage("Analytics")}
          >
            <h2 className={styles.iteem}>Analytics</h2>
          </a>
          <a
            href="#"
            className={`${styles.navItem} ${
              activePage === "Settings" ? styles.active : ""
            }`}
            onClick={() => setActivePage("Settings")}
          >
            <h2 className={styles.iteem}>Settings</h2>
          </a>
        </nav>

        <button className={styles.logoutButton} onClick={() => handleLogout()}>
          <img src={logout} alt="Logout" />
          <h2 className={styles.iteem}>Log out</h2>
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Welcome {user.name}</h1>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.date}>{formattedDate}</p>
            {isPopupVisible && (
              <SharePopup
                message="Link copied to clipboard"
                onClose={() => setIsPopupVisible(false)}
              />
            )}
          </div>
        </header>

        {/* Conditionally render content based on active page */}
        {activePage === "Board" ? (
          <>
            {/* Board Header */}
            <div className={styles.boardHeader}>
              <div className={styles.boardleft}>
                <h2>Board</h2>
                <button
                  className={styles.addPeopleButton}
                  onClick={() => setIsModalOpen(true)}
                >
                  Add People
                </button>
                <img
                  src={People}
                  className={styles.addPeople}
                  alt="Add People"
                />
              </div>

              <select
                onSelect={setrefreshTasks((prev) => !prev)}
                // onChange={(e) => setTimePeriod(e.target.value)}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={styles.periodSelect}
              >
                <option value="This week">This week</option>
                <option value="This month">This month</option>
                <option value="This year">This year</option>
              </select>
            </div>

            {/* Kanban Board */}
            <div className={styles.kanbanBoard}>
              {/* Backlog Column */}
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <h3>Backlog</h3>
                  <img
                    src={deleteimg}
                    alt="Delete"
                    onClick={() => closeChecklistsInColumn("backlog")}
                  />
                </div>
                <div className={styles.columnContent}>
                  {filteredTasks
                    .filter((task) => task.status === "Backlog")
                    .map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onChangeStatus={handleChangeStatus}
                        refreshTasks={setrefreshTasks}
                        handleShare={handleShare}
                        checklistOpen={checklistOpenColumns.backlog}
                        setChecklistOpenColumns={setChecklistOpenColumns}
                        columnName={"backlog"}
                      />
                    ))}
                </div>
              </div>

              {/* To do Column */}
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <h3>To do</h3>
                  <img
                    src={remove}
                    alt="Remove"
                    onClick={() => setIsTaskModalOpen(true)}
                  />

                  <img
                    src={deleteimg}
                    alt="Delete"
                    onClick={() => closeChecklistsInColumn("toDo")}
                  />
                </div>
                <div className={styles.columnContent}>
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onChangeStatus={handleChangeStatus}
                      refreshTasks={setrefreshTasks}
                      handleShare={handleShare}
                      checklistOpen={checklistOpenColumns.toDo}
                      setChecklistOpenColumns={setChecklistOpenColumns}
                      columnName={"toDo"}
                    />
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <h3>In progress</h3>
                  <img
                    src={deleteimg}
                    alt="Delete"
                    onClick={() => closeChecklistsInColumn("inProgress")}
                  />
                </div>
                <div className={styles.columnContent}>
                  {filteredTasks
                    .filter((task) => task.status === "In Progress")
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onChangeStatus={handleChangeStatus}
                        refreshTasks={setrefreshTasks}
                        handleShare={handleShare}
                        checklistOpen={checklistOpenColumns.inProgress}
                        setChecklistOpenColumns={setChecklistOpenColumns}
                        columnName={"inProgress"}
                      />
                    ))}
                </div>
              </div>

              {/* Done Column */}
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <h3>Done</h3>
                  <img
                    src={deleteimg}
                    alt="Delete"
                    onClick={() => closeChecklistsInColumn("done")}
                  />
                </div>
                <div className={styles.columnContent}>
                  {filteredTasks
                    .filter((task) => task.status === "Done")
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onChangeStatus={handleChangeStatus}
                        refreshTasks={setrefreshTasks}
                        handleShare={handleShare}
                        checklistOpen={checklistOpenColumns.done}
                        setChecklistOpenColumns={setChecklistOpenColumns}
                        columnName={"done"}
                      />
                    ))}
                </div>
              </div>
            </div>
          </>
        ) : activePage === "Analytics" ? (
          <Analytics
            backlogCount={backlogCount}
            todoCount={todoCount}
            inProgressCount={inProgressCount}
            completedCount={completedCount}
            // lowPriorityCount={lowPriorityCount}
            // moderatePriorityCount={moderatePriorityCount}
            // highPriorityCount={highPriorityCount}
            // dueDateCount={dueDateCount}
          />
        ) : activePage === "Settings" ? (
          <Settings />
        ) : null}

        {/* Add People Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddPeople}
        />

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          peopleList={peopleList}
          filterTasksByTimePeriod={filterTasksByTimePeriod}
          selectedPeriod={selectedPeriod}
        />
      </main>
    </div>
  );
};

export default Dashboard;
