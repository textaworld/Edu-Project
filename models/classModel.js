const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    inst_ID:{
        type:String
    },
    class_ID:{
        type:String
    },
    grade:{
        type:Number
    },
    subject:{
        type:String
    },
    teacherName:{
        type:String
    },
    teacherPhone:{
        type:Number
    },
    teacherEmail:{
        type:String
    },
    classFees :{
        type:Number
    }
});

const ClassModel = mongoose.model("Class", ClassSchema);

module.exports = ClassModel;

