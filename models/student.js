const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    inst_ID:{
        type:String,
        required:true
    },
    std_ID: {
        type: String,
        required: true,
        unique: true  // Ensures uniqueness of std_ID
    },
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    age: {
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    classs: [
        {
          _id: {
            type: String,
          },
          subject: {
            type: String,
          },
        },
      ],      
      
    stdCount:{
        type:Number,
    }
    
});

const studentModel = mongoose.model("Students", StudentSchema);

module.exports = studentModel;
