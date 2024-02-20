const {userModel} = require('../models/userModel');
const {adminModel} = require('../models/adminModel');
const {categoryModel} = require('../models/categoryModel');
const {templateModel} = require('../models/templateModel');
const {layoutModel} = require('../models/layoutModel');
const {draftModel} = require('../models/draftModel');
const {priceModel} =require('../models/priceModel');
const bcrypt = require('bcrypt')
const validator = require('email-validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const renderDashboard = async (req, res)=>{
	console.log("RENDERING THE DASHBOARD")
	const template_count = await templateModel.count({});
	const draft_count = await draftModel.count({});
	const users_count = await userModel.count({});
	const users = await userModel.find();
	const sanitized_users = users.map(item=>({email:item.email, username:item.username, is_logged_in:item.is_logged_in}));
	return res.render('dashboard',{
		success: true, 
		template_count:template_count,
		draft_count:draft_count,
		users_count:users_count,
		sanitized_users:sanitized_users,
		header_dashboard:true,
		header_signature_templates:false,
		header_add_templates:false,
		header_manage_users:false,
		header_manage_layout:false,
		user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
		message:req.flash('message'),
	})
}

// disable templates
const disableTemplate = async (req, res) => {
	try {
		if(req.query?.template){
			console.log('DISABLING THIS TEMPLATE --->',req.query?.template);
			await templateModel.updateOne({_id: req.query.template}, { disabled: true });
		}
		req.flash('message', 'Template successfully disabled!');
		if(req.query?.page){
			res.redirect(`/signature-templates?page=${req.query?.page}`)
		} else {
			res.redirect("/signature-templates")
		}
	} catch (error) {
		console.log(error);
		req.flash('message', 'Error disabling template.');
		res.end();
	}
}
// enable templates
const enableTemplate = async (req, res) => {
	try {
		if(req.query?.template){
			console.log('DISABLING THIS TEMPLATE --->',req.query?.template);
			await templateModel.updateOne({_id: req.query.template}, { disabled: false });
		}
		req.flash('message', 'Template successfully disabled!');
		if(req.query?.page){
			res.redirect(`/signature-templates?page=${req.query?.page}`)
		} else {
			res.redirect("/signature-templates")
		}
	} catch (error) {
		console.log(error);
		req.flash('message', 'Error disabling template.');
		res.end();
	}
}


const renderSignatureTemplates = async (req, res) => {
	// send the templates too:
	const data = 
	req.query?.category ? 
	req.query.category === "All" ? 
	await templateModel.find({}) :
	await templateModel.find({category:req.query.category})
	:
	await templateModel.find({});

	const sanitized_data = data.map(item=>({
		_id:item._id,
		category: item.category,
		tier: item.tier,
		name:item.name,
		template_img:item?.template_img,
		disabled:item?.disabled
	}));
	const all_categories = await categoryModel.find({});
	const countPerPage = 10;
        let page = req.query.page || 1;
        let temp = (page - 1) * countPerPage;
        let divider = data.length;
        console.log(temp, '===', divider);
        let startCount = temp % divider;
        let endCount = startCount + countPerPage;
        let totalPages = Math.ceil(data.length / countPerPage);

                console.log('Getting Type ->', req.query?.type || 'users');
                console.log('Page Number ->', page, '/', totalPages);
                console.log('start count ->', startCount);
                console.log('end count ->', endCount);

	return res.render('signaturetemplates', {
		logoUrl:'/logo/Email_Sign_Logo.svg',
		header_dashboard:false,
		header_signature_templates:true,
		header_add_templates:false,
		header_manage_users:false,
		header_manage_layout:false,
		data: sanitized_data.slice(startCount, endCount),
		all_categories: all_categories,
		user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
		message:req.flash('message'),
		page:page,
		currentCategory:req.query?.category || 'All',
		startCount:startCount,
		endCount:endCount,
		totalPages:totalPages,
		renderType:'category',
	})

}

const getTemplatesByCategory = async (req, res) => {
	try {
		console.log('category changed')
		const category = encodeURIComponent(req.body.category);
		res.redirect('/signature-templates?category='+ category);
	} catch (error) {
		req.flash('message',{type:'failure', value:'Failed'});
		res.redirect('/signature-templates');
	}
}

const getTemplatesByName = async (req, res) => {
	try {
		console.log(req.body);
		const template_name  = req.body?.template_name || '';
		const result = await templateModel.find({name: new RegExp(template_name, 'i')});
		const final = result?.map(item=>({
			_id:item._id,
			category: item.category,
			tier: item.tier,
			name:item.name,
			template_img:item.template_img,
			disabled:item?.disabled
		}));
		console.log("Got final", final);
		const all_categories = await categoryModel.find({});
		const countPerPage = 2;
        	let page = req.query.page || 1;
        	let temp = (page - 1) * countPerPage;
        	let divider = final.length;
        	console.log(temp, '===', divider);
        	let startCount = temp % divider;
       		let endCount = startCount + countPerPage;
        	let totalPages = final.length / countPerPage;

			console.log('Getting Type ->', req.query?.type || 'users');
			console.log('Page Number ->', page, '/', totalPages);
			console.log('start count ->', startCount);
			console.log('end count ->', endCount);
			return res.render('signaturetemplates', {
				logoUrl:'/logo/Email_Sign_Logo.svg',
				header_dashboard:false,
				header_signature_templates:true,
				header_add_templates:false,
				header_manage_users:false,
				header_manage_layout:false,
				data: final,
				all_categories: all_categories,
				user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
				message:req.flash('message'),
				page:page,
				currentCategory:req.query?.category || 'All',
				startCount:startCount,
				endCount:endCount,
				totalPages:totalPages,
				searchName: template_name,
				renderType:'category',
			})
	} catch (error) {
		console.log("error");
		req.flash('message',{type:'failure', value:'Failed'});
		res.redirect('/signature-templates');
	}
}

const deleteTemplate = async (req, res) => {
	try {
		// delete the template
		const template_id = req.params?.id;
		if(template_id){
			await templateModel.findByIdAndDelete({_id:template_id});
			req.flash('message', {type:'success' ,value:'Template Deleted'})
			res.redirect('/signature-templates')
		} else {
			throw new Error('No Template Id')
		}
	} catch (error) {
		req.flash('message', {type:'failure' ,value:error.message})
		res.redirect('/signature-templates')
	}
}

const renderAddTemplate = async (req, res) => {
	try {
		let match;
		let page;
		if(req.query?.template){
			console.log('EDITING THIS TEMPLATE --->',req.query?.template);
			match = await templateModel.findOne({_id:req.query.template});
			if(req.query?.page){
				page = req.query?.page || 1;
			}
		}
		const all_categories = await categoryModel.find({});
		const price = await priceModel.findOne({price_id:req.query.template});
		console.log('Rendering Template Price Model ==>', price);
		res.render('addtemplate', {
			all_categories: all_categories,
			header_dashboard:false,
			header_signature_templates:false,
			header_add_templates:true,
			header_manage_users:false,
			header_manage_layout:false,
			chosen_template_category: match && match.category,
			chosen_template_tier: match && match.tier ,
			chosen_template_name: match && match.name ,
			chosen_template_custom_category: match && match.category ,
			chosen_template_price : match && price?.price,
			chosen_template_data: match && match.data,
			chosen_template_img: match && match.template_img,
			chosen_template_cta: match && match.cta_data ,
			chosen_template_id: match && match._id ,
			filler_fullName: match && match.filler.fullName,
			filler_designation: match && match.filler.designation,
			filler_contact: match && match.filler.phone,
			filler_email: match && match.filler.email,
			filler_website: match && match.filler.website,
			filler_address: match && match.filler.location,
			filler_image_size: match && match.filler.profileImage_size,
			filler_banner_size: match && match.filler.banner_size,
			user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
			message:req.flash('message'),
			page:page
		})
	} catch (error) {
		console.log(error);
		res.end();
	}
}

const handleAddTemplate = async (req, res) => {
	try {
		// all data will be in body
		console.log('Chosen Template Id:', req.body.template_id);
		if(req.body.template_id){
			const match = await templateModel.findOne({_id:req.body.template_id});
			if(match){
				if(req.body?.template_price){
					const price_match = await priceModel.findOne({price_id:match._id});
					if(price_match){
						price_match.price = req.body?.template_price;
						await price_match.save();
					} else {
						const new_price_model = new priceModel({
							price_id:match._id,
							price:req.body?.template_price
						});
						await new_price_model.save();
					}
				}
				console.log('updating existing template');
				if(req.body?.custom_category){ 
					match.category = req.body?.custom_category;
					const category = await categoryModel.findOne({category: new RegExp(req.body?.custom_category, 'i')});
					if(!category){
						const new_category = new categoryModel({
							category:req.body?.custom_category,
							total_templates:1
						});
						await new_category.save();
					} else {
						category.total_templates +=1;
						await category.save();
					}
				}
				if(req.body?.category) match.category = req.body?.category;
				if(req.body?.tier) match.tier= req.body?.tier;
				if(req.body?.template_name) match.name= req.body?.template_name;
				if(req.body?.template_code) match.data= req.body?.template_code?.trim();
				
				if(typeof req.body?.disclaimer == 'string'){
					match.cta_data.disclaimer = req.body?.disclaimer === "true" ? true : false
				}
				if(typeof req.body?.quote == 'string'){
					match.cta_data.quote = req.body?.quote === "true" ? true : false
				}
				if(typeof req.body?.video == 'string'){
					match.cta_data.video = req.body?.video === "true" ? true : false
				}
				if(typeof req.body?.banner == 'string'){
					match.cta_data.banner = req.body?.banner === "true" ? true : false
				}
				if(typeof req.body?.applink == 'string'){
					match.cta_data.applink = req.body?.applink === "true" ? true : false
				}
				if(typeof req.body?.feedback == 'string'){
					match.cta_data.feedback = req.body?.feedback === "true" ? true : false
				}
				if(req.files['template']) match.template_img= req.files['template'][0]?.filename;
				if(req.files['filler_profileImage']) match.filler.profileImage= req.files['filler_profileImage'][0]?.filename;
				if(req.body?.filler_fullName) match.filler.fullName = req.body?.filler_fullName;
				if(req.body?.filler_designation) match.filler.designation = req.body?.filler_designation;
				if(req.body?.filler_contact) {
					match.filler.phone = req.body?.filler_contact;
				}
				if(req.body?.filler_website) {
					match.filler.website = req.body?.filler_website;
				} else {
					match.filler.website = ''
				}
				if(req.body?.filler_email) {
					match.filler.email = req.body?.filler_email
				} else {
					match.filler.email = ""
				}
				if(req.body?.filler_address){ 
					match.filler.location = req.body?.filler_address;
				} else {
					match.filler.location = ""
				}
				if(req.body?.filler_image_size){ 
					match.filler.profileImage_size = req.body?.filler_image_size;
				} else {
					match.filler.profileImage_size = ""
				}
				if(req.body?.filler_banner_size){ 
					match.filler.banner_size = req.body?.filler_banner_size;
				} else {
					match.filler.banner_size = ""
				}

				await match.save();
				req.flash('message', {type:'success', value:'Template Updated Successfully!'});
				return res.redirect(`/signature-templates?page=${req.body?.page}`);
			} 
		} else {
			console.log('creating new template')
			const id = new mongoose.Types.ObjectId();
			const new_template = new templateModel({
				_id:id,
				category: req.body?.custom_category ? req.body?.custom_category : req.body?.category,
				tier: req.body?.tier,
				name: req.body?.template_name,
				data: req.body?.template_code,
				cta_data: {
					disclaimer:req.body?.disclaimer ? req.body?.disclaimer === 'true' ? true : false : false,
					quote:req.body?.quote ? req.body?.quote === 'true' ? true : false : false,
					video:req.body?.video ? req.body?.video === 'true' ? true : false : false,
					banner:req.body?.banner ? req.body?.banner === 'true' ? true : false : false,
					applink:req.body?.applink ? req.body?.applink === 'true' ? true : false : false,
					feedback:req.body?.feedback ? req.body?.feedback === 'true' ? true : false : false,
				},
				template_img: req.files['template'][0]?.filename || "",
				filler:{
					fullName:req.body?.filler_fullName || "",
					designation:req.body?.filler_designation || "",
					phone:req.body?.filler_contact || "",
					email:req.body?.filler_email || "",
					website:req.body?.filler_website || "",
					profileImage:req.files['filler_profileImage'][0]?.filename,
					location:req.body?.filler_address || "",
					profileImage_size:req.body?.filler_image_size || "",
					banner_size:req.body?.filler_banner_size || "",
				},
			});
			console.log(new_template);
			await new_template.save();
			if(req.body?.template_price){
				const new_price_model = new priceModel({
					price_id:id,
					price:req.body?.template_price
				});
				await new_price_model.save();
			}
			if(req.body?.custom_category){ 
				match.category = req.body?.custom_category;
				const category = await categoryModel.findOne({category: new RegExp(req.body?.custom_category, 'i')});
				if(!category){
					const new_category = new categoryModel({
						category:req.body?.custom_category,
						total_templates:1
					});
					await new_category.save();
				} else {
					category.total_templates +=1;
					await category.save();
				}
			}
			req.flash('message', {type:'success', value:'Template Added Successfully!'});
			res.redirect(`/signature-templates?page=${req.body?.page || 1}`);
		}
	} catch (error) {
		console.log(error);
		req.flash('message', {type:'failure', value:'Failed To Add Template'})
		res.redirect(`/add-template?page=${req.body?.page}`);
	}
}

const updateTemplate = async (req, res) => {
	try{
		const template_id = req.body?.template_id;
		console.log('template Id', template_id);

		const match = await templateModel.findOne({_id: template_id});
		if(match){
			console.log('updating existing template')

			if(req.body?.template_price){
				const price_match = await priceModel.findOne({price_id:match._id});
				if(price_match){
					 console.log('pricemodel match found', price_match);
					 if(price_match?.price !== req.body?.template_price){
						price_match.price = req.body?.template_price;
						await price_match.save();
					}
				} else {
					const new_price_model = new priceModel({
						price_id:match?._id,
				    	price:req.body?.template_price
					});
					await new_price_model.save();
				}
				
			}	
			if(req.body?.custom_category) match.category = req.body?.custom_category;
			if(req.body?.category) match.category = req.body?.category;
			if(req.body?.tier) match.tier= req.body?.tier;
			if(req.body?.template_name) match.name= req.body?.template_name;
			if(req.body?.template_code) match.data= req.body?.template_code;
			if(req.body?.filler_fullName) match.filler.fullName = req.body?.filler_fullName;
			if(req.body?.filler_designation) match.filler.designation = req.body?.filler_designation;
			if(req.body?.filler_contact) {
				match.filler.phone = req.body?.filler_contact;
			}
			if(req.body?.filler_website) {
				match.filler.website = req.body?.filler_website;
			}
			if(req.body?.filler_email) {
				match.filler.email = req.body?.filler_email
			} 
			if(req.body?.filler_address){ 
				match.filler.location = req.body?.filler_address;
			}
			if(req.body?.filler_image_size){ 
				match.filler.profileImage_size = req.body?.filler_image_size;
			}
			if(req.body?.filler_banner_size){ 
				match.filler.banner_size = req.body?.filler_banner_size;
			}
			req.body?.disclaimer ? req.body?.disclaimer === 'true' ? match.social_links.disclaimer = true : false :  match.social_links.disclaimer=match.social_links.disclaimer; 
			// if(req.body?.disclaimer) match.social_links?.disclaimer = req.body?.disclaimer === 'true' ? true : false;
			req.body?.quote ? req.body?.quote === 'true' ? match.social_links.quote = true : false : match.social_links.quote=match.social_links.quote;
			// if(req.body?.quote) match.social_links?.quote = req.body?.quote === 'true' ? true : false;
			req.body?.video ? req.body?.video === 'true' ? match.social_links.video = true : false : match.social_links.video=match.social_links.video;
			// if(req.body?.video) match.social_links?.video = req.body?.video === 'true' ? true : false;
			req.body?.banner ? req.body?.banner === 'true' ? match.social_links.banner = true : false : match.social_links.banner=match.social_links.banner;
			// if(req.body?.banner) match.social_links?.banner = req.body?.banner === 'true' ? true : false;
			req.body?.appLink ? req.body?.appLink === 'true' ? match.social_links.appLink = true : false : match.social_links.appLink=match.social_links.appLink;
			// if(req.body?.applink) match.social_links?.applink = req.body?.applink === 'true' ? true : false;
			req.body?.feedback ? req.body?.feedback === 'true' ? match.social_links.feedback = true : false : match.social_links.feedback=match.social_links.feedback;
			// if(req.body?.feedback) match.social_links?.feedback = req.body?.feedback === 'true' ? true : false;
			if(req.file?.filename) match.template_img= req.file?.filename;
			await match.save();
			req.flash('message', {type:'success', value:'Template Updated Successfully!'});
			return res.redirect('/add-template');
		} else {
			req.flash('message', {type:'failure', value:'Template Not Found'});
			res.redirect('/add-template');
		}
	} catch(error) {
		console.log(error);
		req.flash('message', {type:'failure', value:'Failed To Update Template'});
		res.redirect('/add-template');
	}
}



const renderManageUsers = async (req, res) => {
	try {
		const countPerPage = 10;
		let page = req.query.page || 1;
		const users = await userModel.find({});
		const admin = await adminModel.find({});
		const sanitized_users = users.map(item=>({email:item.email, username:item.username, is_logged_in:item.is_logged_in}));
		const sanitized_admin = admin.map(item=>({email:item.email, username:item.username, profile_pic:item?.profile_pic, role:item?.role, is_logged_in:item.is_logged_in}));
		let temp = (page - 1) * countPerPage;
		let divider = req.query?.type ==='admin' ? sanitized_admin.length : sanitized_users.length;
		console.log(temp, '===', divider);
		let startCount = temp % divider;
		let endCount = startCount + countPerPage;
		let totalPages = req.query?.type ? req.query.type ==='admin' ? Math.ceil(sanitized_admin.length / countPerPage) : Math.ceil(sanitized_users.length / countPerPage) : Math.ceil(sanitized_users.length / countPerPage)
		console.log('Getting Type ->', req.query?.type || 'users');
		console.log('Page Number ->', page, '/', totalPages);
		console.log('start count ->', startCount);
		console.log('end count ->', endCount);
		return res.render('manageusers',{
			header_dashboard:false,
			header_signature_templates:false,
			header_add_templates:false,
			header_manage_users:true,
			header_manage_layout:false,
			data: req.query?.type ? req.query?.type === 'admin' ? sanitized_admin.slice(startCount, endCount): sanitized_users.slice(startCount, endCount) :sanitized_users.slice(startCount, endCount),
			type: req.query?.type ? req.query?.type === 'admin' ? 'admin': 'users' :'users',
			user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
			message:req.flash('message') || "",
			page: page,
			startCount:startCount,
			endCount:endCount,
			totalPages:totalPages,
		})
	} catch (error) {
		console.log(error);
		res.end();
	}
}

const handleCreateUser = async (req, res) => {
	try {
		// username , email, role
		console.log('Creating new User...')
		console.log('req.session', req.session);
		console.log('req.body', req.body);
		const match = await adminModel.findOne({email: req.body?.email});
		if(match){
			console.log('match found')
			const message = encodeURIComponent('Email Already Exists')
			res.redirect('/manage-users?create='+message)
		} else {
			console.log('creating admin Model')
			const new_user = new adminModel({
				username:req.body?.username,
				email:req.body?.email,
				password:await bcrypt.hash(req.body?.password, 10),
				role:parseInt(req.body?.role),
				access_token:'NOT_LOGGED',
				is_logged_in:false
			});
			await new_user.save();

			//send mail
			let mailTransporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: `${process.env.SMTP_MAIL}`, // generated user
                    pass: `${process.env.SMTP_MAIL_PSWD}`  // generated password
                }
            });
             
            let mailDetails = {
                from: `${process.env.SMTP_MAIL}`,
                to: req.body?.email,
                subject: 'Email Signatures: Your Login Credentials',
		html:`<table style="background:rgb(250,250,250);border-collapse:collapse;font-family:Arial,sans-serif;font-weight:normal;margin:0px;padding:0px;width:100%" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
   <tbody>
      <tr>
         <td style="border-collapse:collapse">
            <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-weight:normal;margin:0px auto;max-width:600px;width:100%" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
               <tbody>
                  <tr>
                     <td style="border-collapse:collapse">
                        <span class="im">
                           <table style="border-collapse:collapse;font-family:Roboto,arial;font-weight:normal;margin:0px auto;max-width:600px;width:100%" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                 <tr>
                                    <td style="border-collapse:collapse;font-size:0px;padding:32px 5px 28px;text-align:center" align="center">
                                       <div style="display:inline-block;float:left;max-width:290px;vertical-align:top;width:100%">
                                          <table style="border-collapse:collapse;font-family:Roboto,arial;font-weight:normal" width="100%" cellspacing="0" cellpadding="0">
                                             <tbody>
                                                <tr>
                                                   <td style="border-collapse:collapse;font-size:15px;padding:2px 0px 0px">
                                                      <table style="border-collapse:collapse;font-family:roboto,arial;font-weight:500;width:100%" border="0" width="100%" cellspacing="0" cellpadding="0">
                                                         <tbody>
                                                            <tr>
                                                               <td style="border-collapse:collapse;text-align:left"><img style="height:auto;outline:none;text-decoration:none" src="${process.env.BACKEND_URL}/logo/logo.png" alt="logo " width="80" height="auto"></td>
                                                            </tr>
                                                         </tbody>
                                                      </table>
                                                   </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                       </div>
                                       <div style="display:inline-block;float:right;max-width:290px;vertical-align:top;width:100%">
                                          <table style="border-collapse:collapse;font-family:Roboto,arial;font-weight:normal" width="100%" cellspacing="0" cellpadding="0">
                                             <tbody>
                                                <tr>
                                                   <td style="border-collapse:collapse;font-size:15px;padding:10px 0px 0px">
                                                      <table style="border-collapse:collapse;font-family:roboto,arial;font-weight:500;width:100%" border="0" width="100%" cellspacing="0" cellpadding="0">
                                                         <tbody>
                                                            <tr>
                                                               <td style="border-collapse:collapse;padding-right:0px;padding-top:0px">
                                                                  <table style="border-collapse:collapse;font-family:roboto,arial;font-weight:500;width:100%" border="0" width="100%" cellspacing="0" cellpadding="0">
                                                                     <tbody>
                                                                        <tr>
                                                                           <td style="border-collapse:collapse;color:rgb(144,164,174);font-family:Roboto,arial;font-size:15px;font-weight:bold;line-height:16px;text-align:right" align="right" width="100%"><a style="color:rgb(0,0,0);font-family:Roboto,arial;font-size:18px;font-weight:700;line-height:16px;text-decoration:none" href="${process.env.FRONTEND_URL}" rel="noopener" target="_blank">Email Signatures</a></td>
                                                                        </tr>
                                                                     </tbody>
                                                                  </table>
                                                               </td>
                                                            </tr>
                                                         </tbody>
                                                      </table>
                                                   </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </span>
                        <table style="border-collapse:collapse;border-left:1px solid rgb(221,221,221);border-right:1px solid rgb(221,221,221);border-top:1px solid rgb(221,221,221);font-family:Arial,sans-serif;font-weight:normal;max-width:600px;width:100%;background-color:rgb(255,255,255)" border="0" width="100%" cellspacing="0" cellpadding="0" align="center" bgcolor="#ffffff">
                           <tbody>
                              <tr>
                                 <td style="border-collapse:collapse">
                                    <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%" border="0" width="600" cellspacing="0" cellpadding="0">
                                       <tbody>
                                          <tr>
                                             <td style="max-width:600px;border-collapse:collapse;font-size:16px;padding-right:40px" align="left" width="600">
                                                <span class="im">
                                                   <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%" border="0" width="600" cellspacing="0" cellpadding="0">
                                                      <tbody>
                                                         <tr>
                                                            <td style="max-width:69px;padding-right:12px;padding-left:40px;border-collapse:collapse;padding-top:33px" align="left" width="69"><img style="outline:none;text-decoration:none" src="https://ci6.googleusercontent.com/proxy/c0ae1pHN2D5fZXqAEQywogYhm0u47xu3Ug_yWDvpIIefHp_hSpPLG9enPt24Wgyqx3GxsHnWStIKNZZIpUheM2h7vtHQx5guBqvJm7cEHDUO4urWvvDQnHzPiMnulfbB1Q=s0-d-e1-ft#http://services.google.com/fh/files/emails/hero_icon_project_reinstatement.png" alt="Notification" width="17" height="18" class="CToWUd" data-bit="iit"></td>
                                                            <td style="width:100%;max-width:531px;font-family:Roboto,arial;font-weight:500;font-size:14px;color:rgb(255,255,255);letter-spacing:0.6px;border-collapse:collapse;padding-top:33px" align="left" width="531">Authentication Process Initiated, Email Signatures.</td>
                                                         </tr>
                                                      </tbody>
                                                   </table>
                                                </span>
                                                <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px" border="0" width="600" cellspacing="0" cellpadding="0">
                                                   <tbody>
                                                      <tr>
                                                         <td style="width:100%;max-width:531px;border-collapse:collapse;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px;padding:13px 12px 24px 40px" align="left" width="531">&nbsp; Authentication : Login Credentials.</td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    <table style="max-width:600px;border-collapse:collapse;font-family:Arial,sans-serif;font-weight:normal;width:100%" border="0" width="600" cellspacing="0" cellpadding="0">
                                       <tbody>
                                          <tr>
                                             <td style="width:100%;max-width:520px;padding-top:25px;padding-left:40px;padding-right:40px" width="520">
                                                <table style="max-width:520px;border-collapse:collapse;font-family:Arial,sans-serif;font-weight:normal;width:100%" border="0" width="520" cellspacing="0" cellpadding="0">
                                                   <tbody>
                                                      <tr>
                                                         <td style="padding-bottom:16px;font-family:Roboto,arial;font-weight:normal;font-size:14px;color:rgb(69,90,100);line-height:24px">Hi,</td>
                                                      </tr>
                                                      <tr>
                                                         <td style="padding-bottom:16px;font-family:Roboto,arial;font-size:14px;line-height:24px">
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Warm welcome to Email Signatures. We are excited to serve you. To securely sign in to your Email Signature account, please use the following password. After successful signin please make sure to reset your password. Please don't share this password with anyone. Note that the new password must adhere to the password guidelines.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)"><strong>Password: ${req.body.password}&nbsp;&nbsp;</strong></span></p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)"><strong>Password Guidelines:&nbsp;&nbsp;</strong></span></p>
                                                            <ul style="color:rgb(69,90,100)">
                                                               <li>After successful login, resetting the default password should adhere the following:&nbsp;
                                                               <ol>
                                                               <li>Make sure that the password is atleast 8 characters long.</li>
                                                               <li>The password must contain atleast one uppercase letter.</li>
                                                               <li>The password must contain atleast one lowercase letter.</li>
                                                               <li>The password must contain atleast one number digit.</li>
                                                               <li>The password must contain atleast one special character(like $, @ etc).</li>
                                                               </ol>
                                                               </li>
                                                            </ul>
                                                            <p style="color:rgb(69,90,100)">After successful reset of your password, you will be redirected to the login page, we will reach out to you via email to keep you updated.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Thank you for your patience.&nbsp;For more information regarding Email Signatures process, you may refer to the <a href="emailsignature.react.stagingwebsite.co.in" rel="noopener" target="_blank">Email Signatures FAQs</a>.</p>
                                                         </td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    <span class="im">
                                       <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-weight:normal" border="0" width="100%" cellspacing="0" cellpadding="0">
                                          <tbody>
                                             <tr>
                                                <td style="border-bottom:1px solid rgb(221,221,221);border-collapse:collapse;padding-left:40px;padding-top:19px;width:100%;padding-right:22px" width="100%">
                                                   <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-weight:normal" border="0" cellspacing="0" cellpadding="0">
                                                      <tbody>
                                                         <tr>
                                                            <td style="border-collapse:collapse;color:rgb(69,90,100);font-family:Roboto,arial;font-size:14px;font-weight:normal;line-height:24px;padding-bottom:7px;padding-top:14px">Thanks,</td>
                                                         </tr>
                                                         <tr>
                                                            <td style="border-collapse:collapse;color:rgb(69,90,100);font-family:Roboto,arial;font-size:16px;font-weight:700;line-height:24px;padding-bottom:34px">Email Signatures Team</td>
                                                         </tr>
                                                      </tbody>
                                                   </table>
                                                </td>
                                             </tr>
                                          </tbody>
                                       </table>
                                    </span>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </td>
                  </tr>
                  <tr>
                     <td style="border-collapse:collapse">
                        <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-weight:normal;margin:0px auto;max-width:600px;width:100%" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                           <tbody>
                              <tr>
                                 <td style="border-collapse:collapse;color:rgb(117,117,117);font-family:Roboto,arial;font-size:12px;line-height:16px;padding:36px 40px 0px;text-align:center" align="center"><img style="outline:none;text-decoration:none" src="${process.env.BACKEND_URL}/logo/Email_Sign_Logo.png" alt="Email Signatures" width="125" class="CToWUd" data-bit="iit"></td>
                              </tr>
                              <tr>
                                 <td style="border-collapse:collapse;color:rgb(117,117,117);font-family:Roboto,arial;font-size:12px;line-height:16px;padding:10px 40px 20px;text-align:center" align="center">© 2023&nbsp;Email Signatures Inc.<br><br>You have received this mandatory service announcement to update you about important changes/actions to your Email Signatures account. <br>All Rights Reserved.</td>
                              </tr>
                           </tbody>
                        </table>
                     </td>
                  </tr>
               </tbody>
            </table>
         </td>
      </tr>
      <tr>
         <td style="border-collapse:collapse">&nbsp;</td>
      </tr>
   </tbody>
</table>`,
            };
             
            mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Email sent successfully');
                }
            });
			req.flash('message', {type:'success', value:'User Created Successfully!'})
			res.redirect('/manage-users')
		}
	} catch (error) {
		console.log(error);
		req.flash('message', {type:'failure', value:'Failed!'})
		res.redirect('/manage-users')
	}
}

const handleUserDelete = async (req, res) => {
	try {
		console.log(req.query);
		// will get a query string with user email
		if(req.query.email && req.query?.type){
			console.log(req.query.type, req.query.email);
			if(req.query?.type === 'admin'){
				console.log('In admin find and delete')
				const res = await adminModel.findOneAndDelete({email:req.query.email})
			} else {
				console.log('find one and delete in user')
				const user = await userModel.findOneAndDelete({email:req.query.email});
				// also delete the drafts if any:
				await draftModel.findOneAndDelete({owner:user._id.toString()});
				console.log('drafts deleted!')
			}
			req.flash('message', {type:'success', value:'User Deleted!'})
			res.redirect('/manage-users') 
		} else {
			req.flash('message',{type:'failure', value:'Failed!'});
			res.redirect('/manage-users'); 
		}
	} catch (error) {
		console.log(error);
		req.flash('message',{type:'failure', value:error.message});
		res.redirect('/manage-users'); 
	}
}

const renderManageLayout = async (req, res) => {
	try {
		console.log('###LAYOUT SESSION ', req.session)
		const result = await layoutModel.findOne({});

		return res.render('managelayout', {
			header_dashboard:false,
			header_signature_templates:false,
			header_add_templates:false,
			header_manage_users:false,
			header_manage_layout:true,
			layout_data: result,
			user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
			message:req.flash('message') || ""
		})
	} catch (error) {
		console.log(error);
		res.end();
	}
}

const handleLayoutUpdate = async (req, res) => {
	try {
		const match = await layoutModel.findOne({});
		console.log(req.body)
		if(match){
			if(req.file) match.logo = req.file.filename;
			if(req.body?.copyright) match.copyright = req.body?.copyright;
			match.social_links.facebook = req.body.facebook;
			match.social_links.instagram = req.body.instagram;
			match.social_links.linkedIn = req.body.linkedIn;
			match.social_links.youtube = req.body.youtube;
			if(req.body.testimonials) match.testimonials = req.body.testimonials.filter(item =>( item.length > 0 ))
			if(req.body.q1) match.faqs.Q1.question = req.body.q1;
			if(req.body.a1) match.faqs.Q1.answer = req.body.a1;
			if(req.body.q2) match.faqs.Q2.question = req.body.q2;
			if(req.body.a2) match.faqs.Q2.answer = req.body.a2;
			if(req.body.q3) match.faqs.Q3.question = req.body.q3;
			if(req.body.a3) match.faqs.Q3.answer = req.body.a3;
			if(req.body.q4) match.faqs.Q4.question = req.body.q4;
			if(req.body.a4) match.faqs.Q4.answer = req.body.a4;
			if(req.body.q5) match.faqs.Q5.question = req.body.q5;
			if(req.body.a5) match.faqs.Q5.answer = req.body.a5;
			if(req.body.q6) match.faqs.Q6.question = req.body.q6;
			if(req.body.a6) match.faqs.Q6.answer = req.body.a6;
			await match.save();
			req.flash('message', {type:'success', value:'Layout Updated Successfully!'});
			res.redirect('/manage-layout')
		} else {
			req.flash('message', {type:'failure', value:'Failed!'});
			res.redirect('/manage-layout');
		}
	} catch (error) {
		console.log(error);
		req.flash('message', {type:'failure', value:error.message});
		res.redirect('/manage-layout');
	}
}

const renderErrorHandler = async (req, res) => {
	try{
		res.render('err');
	} catch (error){
		console.log(error.message)
		res.end();
	}
}

const renderViewUser = async (req, res) => {
	try {
		const email = req.query?.email;
		const type = req.query?.type;
		console.log(email, type);
		console.log('##### QUERY #####')
		console.log(email, '->', typeof email);
		console.log(type, '->', typeof type);
		if(!email || !type){
			throw new Error('Invalid Request')
		}
		
		if(type == 'admin'){
			const match = await userModel.findOne({email:email});
			console.log('admin',match);
			if(match){
				const sanitized_admin = {email:match.email, username:match.username, role:match?.role, is_logged_in:match.is_logged_in}
				return res.render('viewuser', {
					header_dashboard:false,
					header_signature_templates:false,
					header_add_templates:false,
					header_manage_users:true,
					header_manage_layout:false,
					data: sanitized_admin,
					type: req.query?.type ? req.query?.type === 'admin' ? 'admin': 'users' :'users',
					user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
					message:req.flash('message') || "",
				})
			} else { throw new Error('1. Invalid User') }
		} 
		if (type == 'users'){
			const match = await userModel.findOne({email:email});
			console.log('user',match)
			if(match){
				const sanitized_user = {email:match.email, username:match.username, is_logged_in:match.is_logged_in, role:'USER'};
				return res.render('viewuser', {
					header_dashboard:false,
					header_signature_templates:false,
					header_add_templates:false,
					header_manage_users:true,
					header_manage_layout:false,
					data: sanitized_user,
					type: req.query?.type ? req.query?.type === 'admin' ? 'admin': 'users' :'users',
					user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
					message:req.flash('message') || "",
				})
			} else { 
				throw new Error('2. Invalid User') 
			}
		} else { 
			throw new Error('3. Invalid User')
		}
	} catch (error) {
		console.log(error.message);
		req.flash('message', {type:'failure', value:error.message})
		res.redirect('/manage-users');
	}
}

const handleAddTestimonial = async (req, res) => {
	try{
		console.log('\n### ADDING TESTIMONIAL ###\n');
		const {testimonial} = req.body;
		console.log('Testimonial :', testimonial);
		if(!testimonial || testimonial == "" || testimonial.split(" ").join("") === "" ) throw new Error('Failed to Add Testimonial');
		const layout = await layoutModel.findOne({});
		if(layout){
	            layout.testimonials.push(testimonial);
            	    await layout.save();
            	    req.flash('message', {type:'success', value:'Testimonial Added'})
            	    res.redirect('/manage-layout')
		} else {
            	    throw new Error('Failed to add.')
        	}
	} catch(error){
	    console.log(error.message);
            req.flash('message', {type:'failure', value:error.message})
            res.redirect('/manage-layout')
	}
}

const handleAddFaq = async (req, res) => {
        try{
            
        } catch(error){

        }
}

const handleDeleteTestimonial = async (req, res) => {
	try{
		console.log('Deleting template...');
		const {testimonial} = req.query;
		console.log('Testimonial', testimonial);
		const layout = await layoutModel.findOne({});
		if(!layout) throw new Error('Failed to delete');
		layout.testimonials = layout.testimonials.filter(item => (item != testimonial) );
		await layout.save();
		req.flash('message', {type:'success', value:'Testimonial Deleted'})
		res.redirect('/manage-layout')
	} catch(error){
		req.flash('message', {type:'failure', value:error.message})
		res.redirect('/manage-layout')
	}
}

const handleDeleteFaq = async (req, res) => {
        try{
		
        } catch(error){

        }
}

const resetPassword = async (req, res) => {
	try {
		// get the email send by user from frontend
		const { email } = req.body;

		console.log(req.body);
		if (email === "") {
				req.flash('message', {type:'failure', value:'Email and/or password are required'});
				return res.redirect('/settings');
		}
		if (!validator.validate(email)) {
				console.log('Inside Validator', email)
				req.flash('message', {type:'failure', value:'Email and/or password are required'});
				return res.redirect('/settings');
		}
		const match = await adminModel.findOne({ email: email });
		//check if the email exists in mongo
		if (match) {
			const forgot_token = jwt.sign({email: email}, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn: 300})
			match.otp_token = forgot_token;
			await match.save();
			let mailTransporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 587,
				secure: false, // true for 465, false for other ports
				auth: {
						user: `${process.env.SMTP_MAIL}`, // generated user
						pass: `${process.env.SMTP_MAIL_PSWD}`  // generated password
				}
			});

			let mailDetails = {
					from: `${process.env.SMTP_MAIL}`,
					to: email,
					subject: 'Email Signatures: Forgot Password Link',
					html: ` <h2 style="background-color:#140342;color:white;padding:10px;"><span><img alt="logo" title="logo-title" style="display:block;" height="60" width="120" src="${process.env.REACT_APP_BACKEND_URL}/logo/Email_Sign_Logo.png"></span>Email Signatures</h2>

				<p><strong>Dear ${match?.username || 'User'},</strong></p>

				<p>We hope you are doing well.</p>

				<p>Below is your <strong style="background-color:#625bf81a;padding:5px; font-size:16px;">Link</strong> to change the password of your Email Signatures Account</p>

				<p>Please follow the following link or paste it in your browser <strong style="background-color:#625bf81a;padding:5px;font-size:12px;"><a href="${process.env.BACKEND_URL + '/change-password-render?token=' + forgot_token + '&email=' + match.email}">CHANGE PASSWORD</a></strong> for validating in to your Email Signatures Account</p>

				<p>Email Signatures is an online platform that has been serving in the field of web email signatures for the past 9 years.</p>

				<p>Links for the social media accounts of Email Signatures Account.</p>

				<p><strong>Our social media accounts:</strong></p>

				<p>Linkedin</p>
				<p><a href="https://www.linkedin.com/company/conative-it-solutions-pvt-ltd/mycompany/company" target="_blank">https://www.linkedin.com/company/conative-it-solutions-pvt-ltd/mycompany/company</p>

				<p>Instagram:</p>
				www.instagram.com/conative_it_solutions/</p>

				<p>Facebook:</p>
				<p><a href="https://www.facebook.com/conativeitsolutions" target="_blank">https://www.facebook.com/conativeitsolutions</p>

				<p>Twitter:</p>
				<p><a href="https://twitter.com/CITSINDORE" target="_blank">https://twitter.com/CITSINDORE</p>

				<p>Pinterest:</p>
				<p><a href="https://in.pinterest.com/conativeitsolutions/" target="_blank">https://in.pinterest.com/conativeitsolutions/</p>

				<p>Skype ID:</p>
				<p><a href="skype:conativeitsolutions" target="_blank">conativeitsolutions</a></p>

				<p><strong>Warm regards,</strong></p>
				<p><strong>Email Signatures Team.</strong></p>`
			};

			mailTransporter.sendMail(mailDetails, function (err, data) {
				if (err) {
					console.log('Error Occurs');
					req.flash('message', {type:'failure', value:'Failed'});
					res.redirect('/settings');

				} else {
					console.log('Email sent successfully');
					req.flash('message', {type:'success', value:'Verification Email Sent'});
					res.redirect('/settings');

				}
			});

		} else {
			req.flash('message', {type:'failure', value:'Email is invalid'});
			res.redirect('/settings');
		}
        } catch (error) {
			console.log(error);
			req.flash('message', {type:'failure', value:'Some error occurred'});
			res.redirect('/settings');
        }
}


module.exports = { 
	getTemplatesByCategory, 
	renderSignatureTemplates, 
	renderDashboard, 
	getTemplatesByName, 
	deleteTemplate, 
	renderAddTemplate, 
	handleAddTemplate, 
	updateTemplate, 
	renderManageUsers, 
	handleCreateUser, 
	handleUserDelete, 
	renderManageLayout, 
	handleLayoutUpdate, 
	renderErrorHandler, 
	renderViewUser,
	handleAddTestimonial, 
	handleAddFaq, 
	handleDeleteTestimonial, 
	handleDeleteFaq,
	resetPassword,
	disableTemplate,
	enableTemplate
}
