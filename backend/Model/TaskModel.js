// models/TaskModel.js
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["High Priority", "Moderate Priority", "Low Priority"],
    required: true,
  },
  checklist: [
    {
      item: {
        type: String,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
  dueDate: {
    type: Date,
  },

  status: {
    type: String,
    default: "To do",
  },

  assignTo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  peopleWithAccess: [
    {
      // Add this field
      type: String,
      default: [],
    },
  ],
});

const TaskModel = mongoose.model("Task", TaskSchema);
module.exports = TaskModel;
