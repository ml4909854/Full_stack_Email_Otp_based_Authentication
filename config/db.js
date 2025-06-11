require("dotenv").config();
const mongoose = require("mongoose");

const mongoUrl = process.env.MONGOURL;
const connectDB = async () => {
  try{
  await mongoose.connect(mongoUrl)
  console.log("db is connected")
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
