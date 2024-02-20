const mongoose = require('mongoose')

const SignatureSchema = new mongoose.Schema({
    template_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Template',
        required:true
    },
    data:{
        type:String,
        required:true
    },
    values:{
		fullName:String,
		logoName:String,
		designation:String,
		phone:String,
		location:String,
		email:String,
		website:String,
		profileImage:String,
		banner:String,
		logoImage:String,
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
		video_img:String,
		video_title:String,
		video_description:String,
		quote:String,
		playStoreAppLink:String,
		appleStoreAppLink:String,
		feedback:String,
		visited:{
			profile:Boolean,
			details:Boolean,
			social:Boolean,
			cta:Boolean
		}
    },
	cta_data:{
        disclaimer:Boolean, 
        quote:Boolean, 
        video:Boolean, 
        banner:Boolean, 
        applink:Boolean, 
        feedback:Boolean
    }
})

const DraftSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    drafts:[SignatureSchema],
})

const draftModel = mongoose.model('Draft', DraftSchema)

module.exports = { draftModel };