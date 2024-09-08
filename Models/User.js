// User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNum: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
  },
  voiceRecording: {
    type: String, // URL or path to the voice recording file
    default: null,
  },
  aiBotEnabled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', UserSchema);



// const mongoose = require("mongoose");

// // Define the User Schema
// const UserSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 3,
//       maxlength: 50,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },
//     phoneNum: {
//       type: String,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },
//     profilePic: {
//       type: String,
//       default: "https://via.placeholder.com/150",
//     },
//     otp: {
//       type: String,
//       default: "",
//     },
//     about: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Create and export the User model using the UserSchema
// const User = mongoose.model('User', UserSchema, 'users');

// module.exports = User;
