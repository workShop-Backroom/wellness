const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser.js");
const multer = require("multer");
const {
  register,
  login,
  allUser,
  updateprofile,
  sendotp,
} = require("../Controllers/auth_controller.js");

const upload = multer();

// Register route
router.post("/register", upload.single("profilePic"), register);

// Login route
router.post("/login", login);
login
// Authenticate user route
// router.get("/auth", fetchuser, authUser);

// Get all users route
router.get("/", fetchuser, allUser);

// Update profile route
router.put("/update", fetchuser, updateprofile);

// Send OTP route
router.post("/getotp", sendotp);

module.exports = router;
