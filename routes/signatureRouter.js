const express = require('express');
const signatureRouter = express.Router();
const signatureController = require('../controllers/signatureController');
const multer = require('multer');
const path = require('path');
const {verifyJWT} = require('../middlewares/verifyJWT');
const crypto = require('crypto');
const fs = require('fs');
// multer setup for resume and profile pic upload

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        if(file.fieldname === 'banner' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')){
            cb(null, path.join(__dirname,'../public/banners'));
        }
        // else if(file.field && (req.body?.imageMIME === 'image/jpg' || req.body?.imageMIME === 'image/png' || req.body?.imageMIME === 'image/jpeg')){
        //     cb(null, path.join(__dirname,'../public/profile'));
        // }
        else if(file.fieldname === 'logo' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg+xml')){
            console.log('destination function')
            cb(null, path.join(__dirname,'../public/logo'));
        } 
        else if(file.fieldname === 'template' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')){
            console.log('destination function, template img')
            cb(null, path.join(__dirname,'../public/templates'));
        }
        else if(file.fieldname === 'filler_profileImage' && (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg')){
            console.log('destination function, template img')
            cb(null, path.join(__dirname,'../public/profile'));
        }   
        else {
            cb(new Error('Invalid Form Field.'),false);
        }
    },
    filename:function(req, file, cb){
        const {username} = req.body;
        let name;
        console.log('Inside FIlename function', file.originalname, file.fieldname)
        if(file.fieldname === 'banner'){
             name = (username||"temp")+'_'+sanitizeFilename(file.originalname);
        } else if( req.body.image){
            name = (username||"temp")+'_'+ sanitizeFilename(req.body?.imageName);
        } else if( file.fieldname === 'filler_profileImage'){
            name = sanitizeFilename(file.originalname);
        }else if( file.fieldname === 'logo'){
            name = sanitizeFilename(file.originalname);
        }  else if( file.fieldname === 'template'){
            name = crypto.randomUUID().split('-').join("")+"."+file.originalname.split(".").pop();
        } else{
            name = sanitizeFilename(file.originalname);
        }
        console.log('in filename function:', file.originalname, file.fieldname)
        cb(null, name);
    }
})

const file_upload = multer({storage:storage, fileFilter:function(req,file,cb){
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg+xml'){
        cb(null, true)
    }
    else if(req.body?.imageMIME === 'image/jpg' || req.body?.imageMIME === 'image/png' || req.body?.imageMIME === 'image/jpeg' || req.body?.imageMIME === 'image/svg+xml'){
        cb(null, true)
    }
	else{
        cb(new Error('File format Not Supported.'), false)
    }
}})

function sanitizeFilename(filename) {
	// Remove spaces, brackets, and URL-sensitive characters using regular expressions
	const sanitizedName = filename.replace(/[\s\[\]{}()<>#%&$!@`"'=|\\^*+,;?:]+/g, '_');
  
	return sanitizedName;
}


signatureRouter.get('/layout-data', signatureController.getLayoutData);
signatureRouter.get('/get-templates', signatureController.getTemplates);
signatureRouter.post('/get-category-templates', signatureController.getTemplatesByCategory);
signatureRouter.get('/get-categories', signatureController.getCategories);
signatureRouter.post('/create', verifyJWT, signatureController.create);

signatureRouter.post('/upload-image', file_upload.single('image'), (req, res)=>{
    try{
		console.log('##### UPLOADING IMAGE #####');	  
		const {imageData} = req.body;
        const dataUrlRegex = /^data:image\/\w+;base64,/;
		if (dataUrlRegex.test(imageData)) {
			const base64Data = imageData.replace(dataUrlRegex, '');
			const buffer = Buffer.from(base64Data, 'base64');
			const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 

            if (buffer.length > MAX_FILE_SIZE) {
                return res.status(400).json({success:false, message:'Image size exceeds the 5MB limit.', sizeLimitExceeded:true});
            }

			// Save the Buffer as a file (adjust the file path and name)
			const fileName = new Date().getTime()+sanitizeFilename(req.body?.imageName); // Replace with your desired file name
			const filePath = path.join(__dirname, '../public/profile', fileName);

			fs.writeFile(filePath, buffer, (err) => {
			if (err) {
				console.error('Error saving file:', err);
				return res.status(500).send('Error saving file');
			}
			// File saved successfully
				res.status(200).json({success:true, message:'Image uploaded and saved successfully', image:fileName});
			});
		} else {
			console.log('Inside else condition');
		}
    }catch(err){
		console.log(err)
        res.status(500).json({success:false, message:'Could Not Upload File. Server Error.', error:err})
    }
});

signatureRouter.post('/upload-banner', file_upload.single('banner'), (req, res)=>{
    try{
        res.status(200).json({success:true, message:'File Uploaded.', data:req.file.filename})
    }catch(err){
        res.status(500).json({success:false, message:'Could Not Upload File. Server Error.', error:err})
    }
});
signatureRouter.post('/upload-logo', verifyJWT, file_upload.single('logo'), (req, res)=>{
    try{
        console.log('inside logo-upload function')
        res.status(200).json({success:true, message:'File Uploaded.',data:req.file.filename})
    }catch(err){
        console.log('inside catch block', err)
        res.status(500).json({success:false, message:'Could Not Upload File. Server Error.', error:err})
    }
});
signatureRouter.post('/upload-template-preview', verifyJWT, file_upload.single('template'), (req, res)=>{
    try{
        console.log('inside template-preview function', req.body, '\n\n req.file->', req.file)
        res.status(200).json({success:true, message:'File Uploaded.',data:req.file.filename})
    }catch(err){
        console.log('inside catch block', err)
        res.status(500).json({success:false, message:'Could Not Upload File. Server Error.', error:err})
    }
});
signatureRouter.post('/delete-template-preview', verifyJWT, signatureController.delete_template_preview);

signatureRouter.post('/get-template', signatureController.getTemplateById);
signatureRouter.post('/get-drafts', verifyJWT, signatureController.get_drafts);
signatureRouter.post('/delete-draft', verifyJWT, signatureController.delete_draft);
signatureRouter.post('/auth', signatureController.gmailAuth);
signatureRouter.get('/callback', signatureController.addSignToGmail);
signatureRouter.post("/get-gmail-save", verifyJWT, signatureController.getGmailData)

module.exports = {signatureRouter, file_upload}
