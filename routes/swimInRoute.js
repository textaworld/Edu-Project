const express = require('express');
const router = express.Router();
const requireAuth = require("../middleware/requirAuthAdmin");

const swimInStudentController = require('../controllers/swimInController');

// Ensure authentication is required for all routes
router.use(requireAuth);

// Create a new SwimInStudent entry
router.post("/createSwimInStudent", swimInStudentController.createSwimInStudent);

// Get a specific SwimInStudent entry by std_ID
router.get("/getSwimInStudentByStdID/:std_ID", swimInStudentController.getSwimInStudentByStdID);

// Update a specific SwimInStudent entry by std_ID
router.put("/updateSwimInStudent/:std_ID", swimInStudentController.updateSwimInStudentByStdID);

// Get SwimInStudent entry by std_ID and date
router.get("/getSwimInStudentByStdIDAndDate/:std_ID/:date", swimInStudentController.getSwimInStudentByStdIDAndDate);

module.exports = router;
