const mongoose = require('mongoose');

const swimOutSchema = new mongoose.Schema({
    inst_ID:{
        type:String,
        required:true
    },
    std_ID: {
        type: String,
        required: true,
       
    },
    outTime: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    

    
});

const SwimOutStudentModel = mongoose.model("SwimOutStudent", swimOutSchema);

module.exports = SwimOutStudentModel;
