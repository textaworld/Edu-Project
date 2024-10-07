const express = require('express');
const router = express.Router();
const requireAuth = require("../middleware/requirAuthAdmin");

const swimOutStudentController = require('../controllers/swimOutController');

// Ensure authentication is required for all routes
router.use(requireAuth);

// Create a new SwimOutStudent entry
router.post("/createSwimOutStudent", swimOutStudentController.createSwimOutStudent);

// Get a specific SwimOutStudent entry by std_ID
router.get("/getSwimOutStudentByStdID/:std_ID", swimOutStudentController.getSwimOutStudentByStdID);

// Update a specific SwimOutStudent entry by std_ID
router.put("/updateSwimOutStudent/:std_ID", swimOutStudentController.updateSwimOutStudentByStdID);

// Get SwimOutStudent entry by std_ID and date
router.get("/getSwimOutStudentByStdIDAndDate/:std_ID/:date", swimOutStudentController.getSwimOutStudentByStdIDAndDate);

module.exports = router;
