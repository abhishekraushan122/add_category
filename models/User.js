const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
   username: {
    type: String,
    required: true,
    unique : true
   } ,
   email:{
    type:String,
    required:true,
    unique:true
   },
   password:{
    type:String,
    required: true
   },
   isAdmin:{
    type:Boolean,
    default: false,
   },
   is_verified: { type: Boolean, default: false },
   otp: { type: String },
   otp_expiration: { type: Date },
   reset_password_token: { type: String },
   reset_password_expires: { type: Date }
},
{timestamps: true}
);

module.exports = mongoose.model("User",UserSchema);