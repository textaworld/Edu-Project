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
router.get("/getAttendanceCounth",attendanceController.getAttendanceCountByStartDateAndEndDate);
router.put("/updateSwimOutTime/:std_ID", attendanceController.updateSwimOutTime); 
router.put("/updateSwimOutTimeByID/:id", attendanceController.updateSwimOutTimeByID); 


module.exports = router;
