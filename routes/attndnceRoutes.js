const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attndnceController");
const requireAuth = require("../middleware/requirAuthAdmin");

router.use(requireAuth);


router.post("/createAttendance", attendanceController.createAttendance);
router.get("/getAllAttendance", attendanceController.getAllAttendances);
router.get(
  "/getAllAttendancesByInsId/:id",
  attendanceController.getAllAttendancesByInsId
);

router.get("/getAttendanceCountsByMonth",attendanceController.getAttendanceCountsByMonth);

module.exports = router;
