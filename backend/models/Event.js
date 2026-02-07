import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  place: String,
  date: String,
  time: String,
  fee: String,
  image: String,
  approvalType: {
    type: String,
    enum: ["qr", "wallet"],
    default: "wallet",
  },
  createdBy: String, // admin wallet address
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
