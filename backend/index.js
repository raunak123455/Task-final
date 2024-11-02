const express = require("express");
const mongoose = require("mongoose");

const app = express();

const cors = require("cors");
const router = require("./routes/AuthRoutes");
require("dotenv").config();

const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8080;
const URL = process.env.DATABASE_URL;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("App working lad");
});

app.use(cors());
app.use(bodyParser.json());

app.use("/api/user/", router);

app.listen(PORT, () => {
  console.log("Listening lad");
});

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log("Error: ", err.message);
  });
