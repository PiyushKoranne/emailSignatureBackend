const mongoose = require('mongoose');
const GmailSaveSchema = new mongoose.Schema({
    email:String,
    signature_data:{
		type:[{
			template_id:String,
        	signature:String
    	}],
		max:1
	}
});

const gmailSaveModel = new mongoose.model('GmailSave', GmailSaveSchema);
module.exports = {gmailSaveModel}