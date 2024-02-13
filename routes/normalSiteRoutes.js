const express = require("express");
const requirAuthAdmin = require("../middleware/requirAuthAdmin");

const { adminLogin, adminResetPassword } = require("../controllers/adminController");
const { getInstitute } = require("../controllers/instituteController");

const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Require auth for all below admin routes -----------
router.use(requirAuthAdmin);

// Get one institute
router.get("/getone/:id", getInstitute);

// reset password
router.post("/resetpassword", adminResetPassword);


module.exports = router;
