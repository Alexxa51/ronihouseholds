// db.js
const mongoose = require("mongoose");

const uri = "mongodb://127.0.0.1:27017/roni_website"; // use 127.0.0.1 instead of localhost

mongoose.connect(uri);

// Log connection events
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("MongoDB connected successfully!");
});

module.exports = db;
