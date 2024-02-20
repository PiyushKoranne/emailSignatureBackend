const mongoose = require('mongoose');
const AdminSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    profile_pic:{
	type:String,
	required:false,
    },
    email:{
        type:String,
        required:true,
        default:'exampla@email.com'
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:Number,
        required:true,
        default:5001
    },
    is_logged_in:{
        type:Boolean,
        required:true,
        default:false
    },
    access_token:{
        type:String,
        required:true,
        default:"NOT_LOGGED"
    },
    otp_token:{
        type:String,
    }
},{timestamps:true});

const adminModel = mongoose.model('Admin', AdminSchema);

module.exports = {adminModel}
