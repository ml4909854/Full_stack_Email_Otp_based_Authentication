const mongoose = require("mongoose");
const roles = require("../constants/roles.js")
const userSchema = new mongoose.Schema({
  username:{
        type:String,
        trim:true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, "Please enter a valid email"],
    index: true
  },
  role: {
    type: String,
    enum: [roles.admin, roles.author],
    default: roles.author
  },
  otp: {
    type: String,
    select: false  // ✅ Hide in queries
  },
  otpExpiresAt: {
    type: Date,
    select: false  // ✅ Optional
  }
}, {
  versionKey: false,
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
