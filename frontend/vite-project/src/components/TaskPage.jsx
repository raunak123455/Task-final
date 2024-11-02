// TaskPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TaskCard from "./TaskCard";
import axios from "axios";
import styles from "./TaskPage.module.css";
import logo from "../assets/logo.png";
import TaskCardd from "./TaskCardd";

const TaskPage = () => {
  const { taskId } = useParams(); // Get taskId from the URL
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/user/tasks/${taskId}`
        );
        setTask(response.data);
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    fetchTask();
  }, [taskId]);

  if (!task) {
    return <p>Loading...</p>; // Loading state while fetching data
  }

  return (
    <div className={styles.taskPage}>
      <div className={styles.logo}>
        <img src={logo} alt="" className={styles.img} />
        <h2 className={styles.iteem}>Pro Manage</h2>
      </div>
      <TaskCardd task={task} onChangeStatus={() => {}} />
    </div>
  );
};

export default TaskPage;
