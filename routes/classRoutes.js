const express = require('express');
const router = express.Router();
const requireAuth = require("../middleware/requirAuthAdmin");

const classController = require('../controllers/classController');

router.use(requireAuth);


router.post("/createClass", classController.createClass);

router.get("/getAllClasses", classController.getAllClasses);

// Get a specific student by ID
router.get("/getClassById/:id", classController.getClassById);

// Update a specific student by ID
router.put("/updateClass/:id", classController.updateClass);

// Delete a specific student by ID
router.delete("/deleteClass/:id", classController.deleteClass);

router.get('/getClassDetailsByClassID/:id',classController.getClassDetailsByClassID);

router.get('/getAllClassesByInsId/:id',classController.getAllClassesByInsId);

module.exports = router;
