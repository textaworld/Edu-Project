const AttendanceModel = require("../models/attendance");

const createAttendance = (req, res) => {
  const { inst_ID, std_ID, name, date, classID, attendance, clzName } =
    req.body;

  const newAttendance = new AttendanceModel({
    inst_ID,
    std_ID,
    name,
    date,
    classID,
    attendance,
    clzName,
  });

  newAttendance
    .save()
    .then((attendance) => res.json(attendance))
    .catch((err) => res.json({ error: err.message }));
};

const getAllAttendances = (req, res) => {
  AttendanceModel.find()
    .then((attendance) => res.json(attendance))
    .catch((err) => res.json({ error: err.message }));
};

const getAllAttendancesByInsId = async (req, res) => {
  const { id } = req.params;

  try {
    const attendances = await AttendanceModel.find({ inst_ID: id }).sort({
      createdAt: -1,
    });

    if (!attendances || attendances.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No attendances found", data: null });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "attendances fetched successfully",
        data: attendances,
      });
  } catch (error) {
    

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createAttendance,
  getAllAttendances,
  getAllAttendancesByInsId,
};
