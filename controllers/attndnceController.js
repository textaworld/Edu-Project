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

const getAttendanceCountsByMonth = async (req, res) => {
  const { std_ID } = req.query;

 // console.log(std_ID)

  try {
    // Aggregate pipeline to group attendance records by month and count
    const aggregationPipeline = [
      {
        $match: {
          std_ID: std_ID
        }
      },
      {
        $group: {
          _id: { $month: "$date" }, // Group by month
          count: { $sum: 1 } // Count attendance records
        }
      }
    ];

    // Execute the aggregation pipeline
    const attendanceCounts = await AttendanceModel.aggregate(aggregationPipeline);

    // Format the results
    const formattedAttendanceCounts = attendanceCounts.map(count => ({
      month: count._id,
      count: count.count
    }));

    // Send back the formatted attendance counts
    res.status(200).json({ success: true, data: formattedAttendanceCounts });

    //console.log(formattedAttendanceCounts)
  } catch (error) {
    console.error("Error fetching attendance counts by month:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


const getAttendanceCountByStartDateAndEndDate = async (req, res) => {
  try {
    const { std_ID, startDate, endDate } = req.query;

    // Convert start and end dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // console.log("start date", start);
    // console.log("end date", end);

    // Fetch attendance records for the specified student ID
    const attendanceRecords = await AttendanceModel.find({ std_ID: std_ID });

    // Filter attendance records based on date range
    const filteredRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      // console.log("recordDate", recordDate);
      // console.log("start", start);
      // console.log("end", end);
      return recordDate >= start && recordDate <= end;
    });

    // Get the count of filtered attendance records
    const attendanceCount = filteredRecords.length;

    // console.log("attendanceRecords", attendanceRecords);
    // console.log("attendance count", attendanceCount);

    // Send back the attendance count
    res.status(200).json({ success: true, attendanceCount });
  } catch (error) {
    console.error('Error while fetching attendance count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports = {
  createAttendance,
  getAllAttendances,
  getAllAttendancesByInsId,
  getAttendanceCountsByMonth,
  getAttendanceCountByStartDateAndEndDate
};
