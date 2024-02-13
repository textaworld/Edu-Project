const mongoose = require('mongoose');

const TuteSchema = new mongoose.Schema({
    inst_ID:{
        type:String
    },
    std_ID:{
        type:String
    },
    name: {
        type:String
    },
    classID:{
        type:String
    },
    month:{
        type:String
    },
    status:{
        type:String,
        default: 'not',
        enum:['gave','not']
    }
});

const TuteModel = mongoose.model("Tutes", TuteSchema);

module.exports = TuteModel;
