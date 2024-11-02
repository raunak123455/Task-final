const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  tasksPosted: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: [],
    },
  ],

  sharedWith: {
    type: [String], // Array of emails that can access all tasks posted by this user
    default: [],
  },

  tasksAssigned: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task", // Reference to Task model
      default: [],
    },
  ],

  peopleList: {
    type: [String], // Store emails added to the board
    default: [],
  },
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
