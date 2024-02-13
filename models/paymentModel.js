const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    inst_ID:{
        type:String
    },
    std_ID:{
        type:String
    },
    name:{
        type:String
    },
    amount:{
        type : Number,
    },
    month :{
        type:String
    },
    classID:{
        type:String
    },
    className:{
        type:String
    },
    status:
    {
        type:String,
        enum:["paid",'not']    
    },
    date:{
        type:Date
    }

});

const PaymentModel = mongoose.model("Payment", PaymentSchema);

module.exports = PaymentModel;
