// Analytics.jsx
import React, { useEffect, useState } from "react";
import styles from "./Analytics.module.css"; // Ensure you have appropriate styling
import axios from "axios";
import { useUser } from "../UserContext";

const Analytics = ({
  backlogCount,
  todoCount,
  inProgressCount,
  completedCount,
}) => {
  const [analyticsData, setAnalyticsData] = useState({
    lowPriorityCount: 0,
    moderatePriorityCount: 0,
    highPriorityCount: 0,
    dueDateCount: 0,
  });

  const { refreshTasks } = useUser();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get(
          "https://task-manager-0yqb.onrender.com/api/user/analytics"
        );
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, [refreshTasks]);
  return (
    <div className={styles.analytics}>
      <h2>Analytics</h2>
      <div className={styles.analyticsGrid}>
        {/* Task Analytics */}
        <div className={styles.analyticsBox}>
          <ul>
            <li>
              Backlog Tasks <span>{backlogCount}</span>
            </li>
            <li>
              To-do Tasks <span>{todoCount}</span>
            </li>
            <li>
              In-Progress Tasks <span>{inProgressCount}</span>
            </li>
            <li>
              Completed Tasks <span>{completedCount}</span>
            </li>
          </ul>
        </div>

        {/* Priority Analytics */}
        <div className={styles.analyticsBox}>
          <ul>
            <li>
              Low Priority <span>{analyticsData.lowPriorityCount}</span>
            </li>
            <li>
              Moderate Priority{" "}
              <span>{analyticsData.moderatePriorityCount}</span>
            </li>
            <li>
              High Priority <span>{analyticsData.highPriorityCount}</span>
            </li>
            <li>
              Due Date Tasks <span>{analyticsData.dueDateCount}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
