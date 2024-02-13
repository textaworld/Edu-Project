const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const {
  createInstritute,
  getAllInstitutes,
  getInstitute,
  updateInstitute,
  deleteInstitute,
} = require("../controllers/instituteController");

const router = express.Router();

// require auth for all workout routes
router.use(requireAuth);

// Create a institute
router.post("/create", createInstritute);

// Get all institutes
router.get("/getall", getAllInstitutes);

// Get one institute
router.get("/getone/:id", getInstitute);

// UPDATE a institute
router.patch("/update/:id", updateInstitute);

// DELETE a institute
router.delete("/delete/:id", deleteInstitute);

module.exports = router;
