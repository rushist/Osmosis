const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  place: String,
  date: String,
  fee: String,
  approvalType: {
    type: String,
    enum: ["qr", "wallet"],
    default: "wallet",
  },
  createdBy: String, // admin wallet address
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);

