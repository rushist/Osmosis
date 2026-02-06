const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { initEmailCron } = require("./cron/emailCron");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Initialize cron jobs after DB connection
    initEmailCron();
  })
  .catch((err) => console.log(err));

app.use("/events", require("./routes/eventRoutes"));
app.use("/register", require("./routes/registrationRoutes"));

app.listen(process.env.PORT, () =>
  console.log("Server is running on port 5000"),
);

