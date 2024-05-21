const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
user_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User",
},
otp:{
    type:Number,
    required:true
},
timestamp:{
    type:Date,
    default:Date.now,
    required:(timestamp) => timestamp.getTime(),
    set: (timestamp) => new Date(timestamp)
}

});