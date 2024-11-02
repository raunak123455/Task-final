const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/UserModel"); // Import the User schema
const Task = require("../Model/TaskModel");
const router = express.Router();
// Secret key for JWT
const JWT_SECRET = "your_secret_key"; // Replace with your actual secret key

// Route for user registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Respond with a success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route for user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the token and user information back to the client
    res.json({
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// router.post("/add-people", async (req, res) => {
//   try {
//     const { userId, email } = req.body;

//     if (!userId || !email) {
//       return res.status(400).json({ error: "User ID and email are required" });
//     }

//     // Find the user by their ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check if the email is already in the peopleList
//     if (user.peopleList.includes(email)) {
//       return res.status(400).json({ error: "Email already added" });
//     }

//     // Add the email to the peopleList
//     user.peopleList.push(email);
//     await user.save();

//     res.status(200).json(user.peopleList); // Send back the updated peopleList
//   } catch (error) {
//     console.error("Error adding email:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.post("/shareAll", async (req, res) => {
//   const { emailToShare, userId } = req.body;

//   if (!userId || !emailToShare) {
//     return res.status(400).json({ error: "User ID and email are required" });
//   }

//   try {
//     // Find the user by their ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check if the email is already in the peopleList
//     if (user.peopleList.includes(emailToShare)) {
//       return res.status(400).json({ error: "Email already added" });
//     }

//     // Add the email to the peopleList and sharedWith array
//     user.peopleList.push(emailToShare);
//     user.sharedWith.push(emailToShare);

//     // Save the updated user document
//     await user.save();

//     res.status(200).json({
//       success: true,
//       peopleList: user.peopleList,
//       message: "Access granted to all tasks.",
//     });
//   } catch (error) {
//     console.error("Error updating shared access:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// routes/user.js
router.post("/add-people", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "User ID and email are required" });
    }

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the email is already in the peopleList
    if (user.peopleList.includes(email)) {
      return res.status(400).json({ error: "Email already added" });
    }

    // Add the email to the peopleList
    user.peopleList.push(email);
    await user.save();

    // Optionally update tasks to reflect this email as having access
    await Task.updateMany(
      { assignTo: user.email }, // or based on your logic for which tasks are being shared
      { $addToSet: { peopleWithAccess: email } } // Add email to a field in the task schema if needed
    );

    res.status(200).json(user.peopleList); // Send back the updated peopleList
  } catch (error) {
    console.error("Error adding email:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId/people-list", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("User ID received:", userId); // Log userId for debugging
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.peopleList);
  } catch (error) {
    console.error("Failed to retrieve people list:", error); // Log error details
    res
      .status(500)
      .json({ error: `Failed to retrieve people list: ${error.message}` });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { title, priority, checklist, dueDate, assignTo, postedBy } =
      req.body;

    const formattedChecklist = checklist.map((item) => ({
      item: String(item.item), // Cast `item` explicitly as a String
      isCompleted: Boolean(item.isCompleted), // Cast `isCompleted` as a Boolean
    }));

    // Create a new task instance
    const newTask = new Task({
      title,
      priority,
      checklist: formattedChecklist, // Use formatted checklist
      dueDate,
      assignTo,
    });

    const savedTask = await newTask.save();

    await User.findOneAndUpdate(
      { email: postedBy },
      { $push: { tasksPosted: savedTask._id } },
      { new: true }
    );

    if (assignTo !== postedBy) {
      await User.findOneAndUpdate(
        { email: assignTo },
        { $push: { tasksAssigned: savedTask._id } },
        { new: true }
      );
    }

    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// router.get("/tasks-posted/:email", async (req, res) => {
//   const { email } = req.params;

//   try {
//     // Find user by email and populate the tasksPosted field
//     const user = await User.findOne({ email }).populate("tasksPosted");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Send back the populated tasksPosted array
//     res.json(user.tasksPosted);
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// });
// routes/tasks.js
router.get("/tasks-posted/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Find user by email and populate tasksPosted field
    const user = await User.findOne({ email }).populate("tasksPosted");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve tasks posted by the user or shared with them
    const tasks = await Task.find({
      $or: [
        { assignTo: user.email }, // Tasks assigned to the user
        { peopleWithAccess: user.email }, // Tasks shared with the user
      ],
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (deletedTask) {
      res.status(200).json({ message: "Task deleted successfully" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", async (req, res) => {
  const { userId, name, email, oldPassword, newPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name and email if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // If updating password, verify old password
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password" });
      }

      // Hash the new password and set it
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
    }

    // Save updated user information
    await user.save();

    // Send updated user data back to the client
    res.json({
      message: "User updated successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/task/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status, "Task status");

    // Ensure status is valid
    // const validStatuses = ["Backlog", "To Do", "In Progress", "Done"];
    // if (!validStatuses.includes(status)) {
    //   return res.status(400).json({ error: "Invalid status value." });
    // }

    // Update task status
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task status." });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    // Count tasks by priority
    const lowPriorityCount = await Task.countDocuments({
      priority: "Low Priority",
    });
    const moderatePriorityCount = await Task.countDocuments({
      priority: "Moderate Priority",
    });
    const highPriorityCount = await Task.countDocuments({
      priority: "High Priority",
    });

    // Count tasks with due dates in the past
    const dueDateCount = await Task.countDocuments({
      dueDate: { $lt: new Date() },
    });

    res.status(200).json({
      lowPriorityCount,
      moderatePriorityCount,
      highPriorityCount,
      dueDateCount,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ message: "Failed to fetch analytics data." });
  }
});

function getDateRange(period) {
  const now = new Date();
  let start, end;

  switch (period) {
    case "today":
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "This week":
      start = new Date(now.setDate(now.getDate() - now.getDay()));
      end = new Date(now.setDate(now.getDate() + (6 - now.getDay())));
      break;
    case "This month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case "This year":
      start = new Date(now.getFullYear(), 0, 1); // January 1st, start of the year
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st, end of the year
      break;
    default:
      start = new Date(now.setDate(now.getDate() - now.getDay()));
      end = new Date(now.setDate(now.getDate() + (6 - now.getDay())));
  }

  return { start, end };
}

router.get("/filtertasks", async (req, res) => {
  const { period } = req.query;
  const { start, end } = getDateRange(period);

  try {
    const filter = start && end ? { dueDate: { $gte: start, $lte: end } } : {};
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tasks", error });
  }
});

module.exports = router;
