const studentModel = require("../models/student");
const studentIdModel = require("../models/StudentIdModel");

const createStudent = async (req, res) => {
  try {
    const {
      inst_ID,
      std_ID,
      name,
      email,
      age,
      address,
      phone,
      classs,
      stdCount,
    } = req.body;

    // Check if std_ID exists in studentIdModel
    const existingStudentId = await studentIdModel.findOne({ std_ID,inst_ID });
    if (existingStudentId) {
      return res.status(400).json({ error: "Student ID is already taken" });
    }

    // Check if a student with the same std_ID exists in studentModel
    // const existingStudent = await studentModel.findOne({ inst_ID, std_ID });
    // if (existingStudent) {
    //   return res.status(400).json({ error: "Student ID is already in use" });
    // }

    // Check existing student count
    const existingStudentCount = await studentModel.countDocuments({ inst_ID });

    // If the existing count is equal to or greater than stdCount, stop adding new students
    if (existingStudentCount >= stdCount) {
      return res.status(400).json({ error: "Student limit reached. Cannot add more students." });
    }

    // Create a StudentId object
    const newStudentId = new studentIdModel({
      inst_ID,
      std_ID
    });

    // Save the StudentId object
    await newStudentId.save();

    // Create a new student in studentModel
    const newStudent = new studentModel({
      inst_ID,
      std_ID,
      name,
      email,
      age,
      address,
      phone,
      classs,
      stdCount,
    });

    const savedStudent = await newStudent.save();
    res.json(savedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const getStudentIds = async (req, res) => {
  try {
      const studentIds = await studentIdModel.find(); // Fetch all student IDs from the database
      res.status(200).json(studentIds); // Return student IDs as JSON response
  } catch (err) {
      res.status(500).json({ message: err.message }); // Handle errors
  }
};



const getAllStudents = (req, res) => {
  studentModel
    .find()
    .then((students) => res.json(students))
    .catch((err) => res.json({ error: err.message }));
};

const getStudentById = (req, res) => {
  const studentId = req.params.id;

  studentModel
    .findById(studentId)
    .then((student) => {
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    })
    .catch((err) => res.json({ error: err.message }));
};

const updateStudent = (req, res) => {
  const studentId = req.params.id;
  const { std_ID, name, email, age, address, phone, classs } = req.body;

  studentModel
    .findByIdAndUpdate(
      studentId,
      {
        std_ID,
        name,
        email,
        age,
        address,
        phone,
        classs: classs, // Corrected here
      },
      { new: true }
    )
    .then((updatedStudent) => {
      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(updatedStudent);
    })
    .catch((err) => res.json({ error: err.message }));
};

const deleteStudent = (req, res) => {
  const std_ID = req.params.id;

  studentModel
    .findByIdAndDelete(std_ID)
    .then((deletedStudent) => {
      if (!deletedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json({ message: "Student deleted successfully" });
    })
    .catch((err) => res.json({ error: err.message }));
};

const getStudentDetailsBySTD_ID = async (req, res) => {
  const { std_ID } = req.params; // Assuming std_ID is passed as a parameter in the request

  try {
    const student = await studentModel.findOne({ std_ID });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ student });
  } catch (error) {
    
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllStudentsByClassID = async (req, res) => {
  const classID = req.params.classID;

  try {
    const students = await studentModel.find({ "classs._id": classID });
    res.json(students);
  } catch (error) {
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllStudentsByInsId = async (req, res) => {
  const { id } = req.params;

  try {
    const students = await studentModel
      .find({ inst_ID: id })
      .sort({ createdAt: -1 });

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No students found", data: null });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Students fetched successfully",
        data: students,
      });
  } catch (error) {
    

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};




const getAllStudentsBySubject = async (req, res) => {
  const { id } = req.params;
  const { subject } = req.query;

  try {

    
    const students = await studentModel.find({
      inst_ID: id,
      "classs.subject": subject
    });

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for the given subject",
        data: null
      });
    }

    // Extract phone numbers of students
    const phoneNumbers = students.map(student => student.phone);

    res.status(200).json({
      success: true,
      message: "Phone numbers of students for the given subject fetched successfully",
      data: phoneNumbers
    });
  } catch (error) {
    console.error("Error fetching students by subject:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


const searchStudentByStd_ID = async (req, res) => {
  const { std_ID } = req.query;

  console.log(std_ID)

  try {
    const student = await studentModel.findOne({ std_ID });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ phone: student.phone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentDetailsBySTD_ID,
  getAllStudentsByClassID,
  getAllStudentsByInsId,
  getAllStudentsBySubject,
  searchStudentByStd_ID,
  getStudentIds
};
