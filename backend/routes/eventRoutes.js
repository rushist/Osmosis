import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const event = await Event.create(req.body);
  res.json(event);
});

router.get("/", async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});

router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
