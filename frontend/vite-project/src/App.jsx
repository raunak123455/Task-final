import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Register from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import { UserProvider } from "./UserContext";
import TaskPage from "./components/TaskPage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks/:taskId" element={<TaskPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
