import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { initEmailCron } from "./cron/emailCron.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    initEmailCron();
  })
  .catch((err) => console.log(err));

app.use("/events", eventRoutes);
app.use("/register", registrationRoutes);
app.use("/upload", uploadRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log("Server is running on port 5000"),
);
