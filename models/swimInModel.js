const mongoose = require('mongoose');

const swimInSchema = new mongoose.Schema({
    inst_ID: {
        type: String,
        required: true
    },
    std_ID: {
        type: String,
        required: true,
        // Remove any unique: true constraint
    },
    inTime: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
});

const SwimInStudentModel = mongoose.model("SwimInStudent", swimInSchema);

module.exports = SwimInStudentModel;
