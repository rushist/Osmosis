const mongoose = require("mongoose");
require("dotenv").config();

const Event = require("./models/Event");

const events = [
  {
    title: "Beach Cleanup Drive",
    place: "Juhu Beach",
    date: "12 Feb 2026",
    time: "09:00 AM",
    fee: "0.01 ETH",
    approvalType: "qr",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    createdBy: "0xd7e975FBa8e361093CE9D63832c585f471B12803"
  },
  {
    title: "Plastic Awareness Workshop",
    place: "Bandra Community Hall",
    date: "18 Feb 2026",
    time: "02:00 PM",
    fee: "Free",
    approvalType: "wallet",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop",
    createdBy: "0xd7e975FBa8e361093CE9D63832c585f471B12803"
  },
  {
    title: "Recycling Hackathon",
    place: "VESIT Auditorium",
    date: "25 Feb 2026",
    time: "10:00 AM",
    fee: "0.02 ETH",
    approvalType: "qr",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    createdBy: "0xd7e975FBa8e361093CE9D63832c585f471B12803"
  },
  {
    title: "Tree Plantation Drive",
    place: "Sanjay Gandhi National Park",
    date: "05 Mar 2026",
    time: "07:00 AM",
    fee: "Free",
    approvalType: "wallet",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop",
    createdBy: "0xd7e975FBa8e361093CE9D63832c585f471B12803"
  },
  {
    title: "Green Tech Summit",
    place: "IIT Bombay Convention Center",
    date: "15 Mar 2026",
    time: "11:00 AM",
    fee: "0.05 ETH",
    approvalType: "qr",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
    createdBy: "0xd7e975FBa8e361093CE9D63832c585f471B12803"
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongo connected");

    await Event.deleteMany();
    await Event.insertMany(events);

    console.log("Events inserted successfully:", events.length, "events");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
