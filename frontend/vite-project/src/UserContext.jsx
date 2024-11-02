import React, { createContext, useState, useContext, useEffect } from "react";

// Create UserContext
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};

// UserProvider component to wrap the entire app
export const UserProvider = ({ children }) => {
  const [userObject, setUserObject] = useState(() => {
    // Initialize userObject from session storage if it exists
    const storedUser = sessionStorage.getItem("userObject");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [TaskToEdit, setTaskToEdit] = useState();

  const [user, setUser] = useState({
    name: "",
  });

  const [refreshTasks, setrefreshTasks] = useState(false);

  const [loggedIn, setLoggedIn] = useState(() => {
    // Initialize loggedIn state from session storage if it exists
    return sessionStorage.getItem("loggedIn") === "true";
  });
  const [mail, setMail] = useState("");

  const updateUser = (name) => {
    setUser({ ...user, name });
  };

  useEffect(() => {
    if (userObject) {
      sessionStorage.setItem("userObject", JSON.stringify(userObject));
      setMail(userObject.email);
      setLoggedIn(true);
    }
  }, [userObject]);

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        loggedIn,
        setLoggedIn,
        userObject,
        setUserObject,
        mail,
        setMail,
        isTaskModalOpen,
        setIsTaskModalOpen,
        TaskToEdit,
        setTaskToEdit,
        refreshTasks,
        setrefreshTasks,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
