const mongoose = require('mongoose');
const TemplateSchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
        default:'IT'
    },
    tier:{
        type:String,
        required:true,
        default:'Tier-3'
    },
    name:{
        type:String,
        required:false,
    },
    disabled:{
        type:Boolean,
        default:false
    },

    data:{
        type:String,
        required:true
    }, 
    filler:{
        fullName:String,
        logoName:String,
        designation:String,
        phone:String,
        email:String,
        website:String,
        profileImage:String,
        banner:String,
        facebook:String,
        instagram:String,
        youtube:String,
        twitter:String,
        linkedIn:String,
        pinterest:String,
		skype:String,
		whatsapp:String,
        disclaimer:String,
        video:String,
        quote:String,
        appLink:String,
        custom:String,
        feedback:String,
        location:String,
		profileImage_size:String,
		banner_size:String,
    },
    cta_data:{
        disclaimer:Boolean, 
        quote:Boolean, 
        video:Boolean, 
        banner:Boolean, 
        applink:Boolean, 
        feedback:Boolean
    }, 
    template_img:{
        type:String
    }
})

const templateModel = mongoose.model('Template', TemplateSchema);

module.exports = {templateModel}