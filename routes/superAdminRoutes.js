const express = require("express");
const requireAuth = require("../middleware/requireAuth");


const {
  signupSuperAdmin,
  loginSuperAdmin,
  verifyLogin,
  superAdminForgotPassword, 
  superAdminResetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Super admin register
router.post("/register", signupSuperAdmin);

// Super admin login
router.post("/login", loginSuperAdmin);

// Super admin verify login
router.post("/verifylogin", verifyLogin);

// Adimin forgotpassword
router.post("/forgotpassword", superAdminForgotPassword);

router.use(requireAuth);

// reset password
router.post("/resetpassword", superAdminResetPassword);


module.exports = router;
