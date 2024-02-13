const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const {
  adminRegister,
  adminLogin,
  getAllAdmins,
  adminForgotPassword,
  getAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");

const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Adimin forgotpassword
router.post("/forgotpassword", adminForgotPassword);



// Require auth for all below admin routes -----------
router.use(requireAuth);


// Create a admin
router.post("/register", adminRegister);

// Get all admins in one institute
router.get("/getall/:id", getAllAdmins);

// Get one admin
router.get("/getone/:id", getAdmin);

// UPDATE a admin
router.patch("/update/:id", updateAdmin);

// DELETE a admin
router.delete("/delete/:id", deleteAdmin);

module.exports = router;
