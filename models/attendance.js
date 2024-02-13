const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    inst_ID:{
        type:String
    },
    std_ID:{
        type:String
    },
    name:{
        type:String
    } ,
    date:{
        type:Date
    },
    classID:{
        type:String
    },
    attendance: {
        type: String,
    enum: ['yes', 'no']
    },
    clzName:{
        type:String
    }

});

const AttendanceModel = mongoose.model("Attendance", AttendanceSchema);

module.exports = AttendanceModel;
