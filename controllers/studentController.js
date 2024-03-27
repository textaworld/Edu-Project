const studentModel = require("../models/student");

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

    // Check existing student count
    const existingStudentCount = await studentModel.countDocuments({ inst_ID });

    // If the existing count is equal to or greater than stdCount, stop adding new students
    if (existingStudentCount >= stdCount) {
      return res
        .status(400)
        .json({ error: "Student limit reached. Cannot add more students." });
    }

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
  searchStudentByStd_ID
};
