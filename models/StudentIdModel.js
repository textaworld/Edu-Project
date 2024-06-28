const mongoose = require('mongoose');

const StudentIDSchema = new mongoose.Schema({
    inst_ID:{
        type:String,
        required:true
    },
    std_ID: {
        type: String,
        required: true,
        unique: true  
    },

    
});

const studentIdModel = mongoose.model("StudentIds", StudentIDSchema);

module.exports = studentIdModel;
