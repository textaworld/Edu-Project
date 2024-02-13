const express = require("express");
const router = express.Router();

const { sendEmail } = require("../controllers/emailController");
const requireAuth = require("../middleware/requirAuthAdmin");

router.use(requireAuth);

router.post("/sendEmail", sendEmail);

module.exports = router;