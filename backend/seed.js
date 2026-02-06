const mongoose = require("mongoose");
require("dotenv").config();

const Event = require("./models/Event");

const events = [
  {
    title: "Beach Cleanup Drive",
    place: "Juhu Beach",
    date: "12 Feb 2026",
    fee: "0.01 ETH",
    image: "https://images.unsplash.com/photo-1585951149385-27a059e04594?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    title: "Plastic Awareness Workshop",
    place: "Bandra Community Hall",
    date: "18 Feb 2026",
    fee: "Free",
    image: "https://images.unsplash.com/photo-1585951149385-27a059e04594?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    title: "Recycling Hackathon",
    place: "VESIT Auditorium",
    date: "25 Feb 2026",
    fee: "0.02 ETH",
    image: "https://images.unsplash.com/photo-1585951149385-27a059e04594?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongo connected");

    await Event.deleteMany();
    await Event.insertMany(events);

    console.log("Events inserted successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
