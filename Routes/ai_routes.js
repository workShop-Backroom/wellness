const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser.js");
const { sendAIResponse } = require("../Controllers/ai_controller.js");

router.post("/send-ai-response", fetchuser, sendAIResponse);

module.exports = router;