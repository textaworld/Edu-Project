const express = require('express');
const router = express.Router();
const requireAuth = require("../middleware/requirAuthAdmin");

const studentController = require('../controllers/studentController');

router.use(requireAuth);


router.post("/createStudent", studentController.createStudent);

router.get("/getAllStudents", studentController.getAllStudents);

// Get a specific student by ID
router.get("/getStudentById/:id", studentController.getStudentById);

// Update a specific student by ID
router.put("/updateStudent/:id", studentController.updateStudent);

// Delete a specific student by ID
router.delete("/deleteStudent/:id", studentController.deleteStudent);

router.get('/getStudentByStd_Id/:std_ID',studentController. getStudentDetailsBySTD_ID);

router.get('/getAllStudentsByClassID/:classID',studentController.getAllStudentsByClassID);


router.get('/getAllStudentsByInsId/:id',studentController.getAllStudentsByInsId);

router.get('/getAllStudentsBySubject/:id/subject', studentController.getAllStudentsBySubject);


router.get('/searchStudentByStd_ID', studentController.searchStudentByStd_ID);

module.exports = router;


//router.post("/createStudent",upload.single('idImage'), studentController.createStudent);
//router.post("/imageup",upload.single('file'));

