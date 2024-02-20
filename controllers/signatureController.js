const {templateModel} = require('../models/templateModel');
const {draftModel} = require('../models/draftModel');
const {userModel} = require('../models/userModel');
const {layoutModel} = require('../models/layoutModel');
const {gmailSaveModel} = require('../models/gmailSaves');
const {categoryModel} = require('../models/categoryModel');
const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const content = fs.readFileSync(CREDENTIALS_PATH);
const keys = JSON.parse(content);
const key = keys.installed || keys.web;
const credentials = {
    client_id:key.client_id,
    client_secret:key.client_secret,
    redirect_uri:process.env.BACKEND_URL+'/signature/callback'
}

// create a new instance of oAuth 2

const oauth2Client = new google.auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uri);
const frontEndRedirectUrl = process.env.PRODUCTION_URL+'/success'

// hit this endpoint from the frontend
const gmailAuth = async (req, res) => {
    console.log('INSIDE GMAIL AUTH FUNCTION')
    try {
        const {signature_data, email, template_id} = req.body;
        const result = await gmailSaveModel.findOne({email:email});
        if(result){
            console.log('match found saving to gmail saves mongo')
            result.signature_data.push({template_id,signature:signature_data});
            await result.save();

        } else {
            console.log('creating new gmail saves mongo')
            const gmailsave = new gmailSaveModel({
                email:email,
                signature_data:[{
					template_id:template_id,
					signature:signature_data
				}]
            })
            await gmailsave.save();
        }
        
        // get sinature from req. body and save it in mongo temporarily
        const authUrl = oauth2Client.generateAuthUrl({access_type:'offline', prompt: 'select_account', scope:['https://www.googleapis.com/auth/gmail.settings.basic', 'https://www.googleapis.com/auth/gmail.readonly'], state:email});
        res.status(200).json({authUrl});
    } catch (error) {
        res.status(400).json({success:false});
    }
}

// after consent this endpoint is hit
const addSignToGmail = async (req, res) => {
    const {code, state} = req.query;
    if(!code || !state){
	 return res.redirect(`${frontEndRedirectUrl}?success=false`)
    }
    const tokens = await oauth2Client.getToken(code);
    if(tokens){
        oauth2Client.setCredentials(tokens.tokens);
    }
    try {
        const match = await gmailSaveModel.findOne({email:state})
        if(match){
            await changeEmailSignature(match.signature_data[match.signature_data.length -1]?.signature);
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
				to: state,
				subject: 'Thank you for choosing Email Signature',
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
																			<td style="border-collapse:collapse;text-align:left"><img style="height:auto;outline:none;text-decoration:none" src="${process.env.BACKEND_URL}/logo/logo.png" alt="logo " width="175" height="auto"></td>
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
																						<td style="border-collapse:collapse;color:rgb(144,164,174);font-family:Roboto,arial;font-size:15px;font-weight:bold;line-height:16px;text-align:right" align="right" width="100%"><a style="color:rgb(0,0,0);font-family:Roboto,arial;font-size:18px;font-weight:700;line-height:16px;text-decoration:none" href="${process.env.FRONTEND_URL}" rel="noopener" target="_blank">Email Signature</a></td>
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
																		 <td style="width:100%;max-width:531px;font-family:Roboto,arial;font-weight:500;font-size:14px;color:rgb(255,255,255);letter-spacing:0.6px;border-collapse:collapse;padding-top:33px" align="left" width="531">New Signature Created, Email Signature.</td>
																	  </tr>
																   </tbody>
																</table>
															 </span>
															 <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px" border="0" width="600" cellspacing="0" cellpadding="0">
																<tbody>
																   <tr>
																	  <td style="width:100%;max-width:531px;border-collapse:collapse;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px;padding:13px 12px 24px 40px" align="left" width="531">&nbsp; Thankyou for choosing Email Siganatures</td>
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
																	  <td style="padding-bottom:16px;font-family:Roboto,arial;font-weight:normal;font-size:14px;color:rgb(69,90,100);line-height:24px">Hey there!</td>
																   </tr>
																   <tr>
																	  <td style="padding-bottom:16px;font-family:Roboto,arial;font-size:14px;line-height:24px">
																		 <!-- <p>Thankyou for choosing Email Siganature</p> -->
																		 <p>A huge congratulations for taking the step to be a part of our community! Your decision has brought us immense joy, and we can't wait to journey with you.

Thank you for choosing our website. We understand there are plenty of options out there, and we're truly honored you've trusted us. Our promise is to continually strive to meet your expectations and deliver the best experience possible.

</p>
																		 <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)">

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
																		 <td style="border-collapse:collapse;color:rgb(69,90,100);font-family:Roboto,arial;font-size:16px;font-weight:700;line-height:24px;padding-bottom:34px">Email Signature Team</td>
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
											  <td style="border-collapse:collapse;color:rgb(117,117,117);font-family:Roboto,arial;font-size:12px;line-height:16px;padding:36px 40px 0px;text-align:center" align="center"><img style="outline:none;text-decoration:none" src="${process.env.BACKEND_URL}/logo/Email_Sign_Logo.png" alt="Email Signature" width="125" class="CToWUd" data-bit="iit"></td>
										   </tr>
										   <tr>
											  <td style="border-collapse:collapse;color:rgb(117,117,117);font-family:Roboto,arial;font-size:12px;line-height:16px;padding:10px 40px 20px;text-align:center" align="center">© 2023&nbsp;Email Signature Inc.<br><br>You have received this mandatory service announcement to update you about important changes/actions to your Email Signature account. <br>All Rights Reserved.</td>
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
			}
				mailTransporter.sendMail(mailDetails, (err, data)=>{
					if(err) console.log('Failed To Send Welcome Email',err);
					else {
						console.log('Welcome Email Sent!')
					}

				})
            res.redirect(`${frontEndRedirectUrl}?success=true&template_id=${match.signature_data[match.signature_data.length -1]?.template_id}`)
            // res.end();
        }
    } catch (error) {
        console.log('While setting signature',error)
        res.redirect(`${frontEndRedirectUrl}?success=false`)
    }
}

async function getGmailData(req, res) {
	if(req.jwt){
		const { email } = req.body;
		console.log('Adding Data to drafts ::', req.body?.userData);
		if(email !== req.jwt.email){
			return res.status(403).json({success:false, message:'UNAUTHORIZED'});
		} else {
			const data = await gmailSaveModel.findOne({email:email});
			if(!data){
				return res.status(400).json({success:false, message:'Gmail data not found.'});
			} else {
				res.status(200).json({success:true, gmailData:data?.signature_data[data?.signature_data?.length - 1]});
			}
		}
	} else {
		res.status(403).json({success:false, message:"Unauthorized"});
	}
}


async function changeEmailSignature(signature) {
    const gmail = google.gmail({version:'v1', auth:oauth2Client});
    const profile = await gmail.users.getProfile({userId:'me'});
    const signatureResponse = await gmail.users.settings.sendAs.update({
        userId:'me',
        sendAsEmail:profile.data.emailAddress,
        fields:'signature',
        resource:{
            signature:`${signature}`
        }
    })
    console.log('SIGNATURE UPDATED')
}

const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.status(200).json({success:true, message:'Categories', categories:categories})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message:'FAILED'})
    }
}

const getLayoutData = async (req, res) => {
    try {
        const match = await layoutModel.findOne({});
		console.log("GETTING LAYOUT DATA\n\n\n", match);
        if(match){
            res.status(200).json({success:true, message:'SUCCESS', layout_data:match});
        } else {
            res.status(400).json({success:false, message:'CANNOT GET DATA'});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:'FAILED'});
    }
}


const create = async (req, res) => {
    try {
        if(req.jwt){
            const { email, owner } = req.body;
			console.log('Adding Data to drafts ::', req.body?.userData);
            if(email !== req.jwt.email){
                return res.status(403).json({success:false, message:'UNAUTHORIZED'})
            } else {
                console.log('username matched !! finding user in mongo...')
                // now call mongo for the user get accecss token stored on mongo and compare
                const match = await userModel.findOne({email:email});
                if(match){
                    console.log('match found')
					const access_token = req.headers.authorization.split(' ')[1];
                    if(jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET)){
                        console.log('access_tokens match!! creating new model')
                        // now you can add template
                        const draft_match = await draftModel.findOne({owner:owner});
                        if(draft_match){
							console.log('Draft Match Found', draft_match)
							if(draft_match?.drafts?.some(item => item?.template_id?.toString() === req.body?.template_id)){
								draft_match.drafts = draft_match?.drafts?.map(item => {
									if(item?.template_id?.toString() === req.body?.template_id){
										return ({
											template_id:req.body.template_id, 
											data:req.body.data, 
											values: req.body?.userData, 
											cta_data:req.body?.cta_data
										})
									} else return item
								})
							} else {
								draft_match.drafts.push(
									{
										template_id:req.body.template_id, 
										data:req.body.data, 
										values: req.body?.userData, 
										cta_data:req.body?.cta_data
									}
								)
							}
                            const result = await draft_match.save();
							match.new_user = false;
							await match.save();
                            res.status(201).json({success:true, message:'Added to your drafts', result});
                        } else {
                            const draft = new draftModel({
                                owner:req.body.owner,
                                drafts:[{
                                    template_id:req.body.template_id,
                                    data:req.body.data,
                                    values:{
                                        fullName:req.body?.userData?.fullName,
                                        logoName:req.body?.userData?.logoName,
                                        designation:req.body?.userData?.designation,
                                        phone:req.body?.userData?.phone,
                                        email:req.body?.userData?.email,
                                        website:req.body?.userData?.website,
                                        profileImage:req.body?.userData?.profileImage,
                                        logoImage:req.body?.userData?.logoImage,
                                        facebook:req.body?.userData?.facebook,
                                        instagram:req.body?.userData?.instagram,
                                        youtube:req.body?.userData?.youtube,
                                        twitter:req.body?.userData?.twitter,
                                        linkedIn:req.body?.userData?.linkedIn,
                                        pinterest:req.body?.userData?.pinterest,
                                        skype:req.body?.userData?.skype,
                                        whatsapp:req.body?.userData?.whatsapp,
                                        disclaimer:req.body?.userData?.disclaimer,
                                        video:req.body?.userData?.video,
                                        quote:req.body?.userData?.quote,
                                        appLink:req.body?.userData?.appLink,
                                        custom:req.body?.userData?.custom,
										location:req.body?.userData?.location
                                    },
                                    cta_data:{...req.body?.cta_data}
                                }]
                            });
                            console.log('draft', draft);
                            const result = await draft.save();
							match.new_user = false;
							await match.save();
                            res.status(201).json({success:true, message:'Added to your drafts', result});
                        }
                    } else {
                        res.status(403).json({success:false, message:'TOKEN INVALID. UNAUTHORIZED.'})
                    }
                } else {
                    console.log('match NOT FOUND in mongo... ')
                    res.status(403).json({success:false, message:'UNAUTHORIZED'})
                }
            }
        } else {
            res.status(403).json({success:false, message:'UNAUTHORIZED'})
        }
    } catch (error) {
		console.log(error);
        res.status(500).json({success:false, message:'FAILED'})
    }
}

const getTemplatesByCategory = async ( req, res ) =>{
    try {
        const start_count = req?.body?.start_count || 0;
        const end_count = start_count + 50;
        const data = await templateModel.find({category:req.body.category});
        res.status(200).json({success:true, message:"SUCCESS", data:data.slice(start_count,end_count)});
    } catch (error) {
        res.status(500).json({success:false, message:'FAILED'});
    }
}  

const getTemplates = async ( req, res ) =>{
    try {
        const start_count = req?.body?.start_count || 0;
        const end_count = start_count + 50;
        const data = await templateModel.find({disabled:false});
        res.status(200).json({success:true, message:"SUCCESS", data:data?.slice(start_count,end_count)});
    } catch (error) {
        res.status(500).json({success:false, message:'FAILED'})
    }
}

const getTemplateById = async(req, res) => {
    try {
		console.log('### GETTING TEMPLATE BY ID ###', req.body)
        const match = await templateModel.findOne({_id:req.body.template_id});
        if(match){
            res.status(200).json({success:true, message:'SUCCESS', data:match});
        }else{
            res.status(400).json({success:false, message:'TEMPLATE NOT FOUND'});
        }
    } catch (error) {
		console.log(error)
        res.status(500).json({success:false, message:'FAILED'})
    }
}
const get_drafts = async (req, res) => {
    try {
        if(req.jwt){
            const { email, owner } = req.body;
            if(email !== req.jwt.email){
                return res.status(403).json({success:false, message:'UNAUTHORIZED'})
            } else{
                console.log('username matched !! finding user in mongo...')
                // now call mongo for the user get accecss token stored on mongo and compare
                const match = await userModel.findOne({email:email});
                if(match){
                    console.log('match found')
					const access_token = req.headers.authorization.split(' ')[1];
                    if(jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET)){
                        console.log('access_tokens match.')
                        const data = await draftModel.findOne({owner:owner});
						console.log(data);
						console.log(data?.drafts[0]?.values);
                        res.status(200).json({success:true, message:'Success', result:data});
                    } else {
                        res.status(403).json({success:false, message:'TOKEN INVALID. UNAUTHORIZED.'})
                    }
                } else {
                    console.log('match NOT FOUND in mongo... ')
                    res.status(403).json({success:false, message:'UNAUTHORIZED'})
                }
            }
        } else {
            res.status(403).json({success:false, message:'UNAUTHORIZED'})
        }
    } catch (error) {
		console.log(error)
        res.status(500).json({success:false, message:'FAILED'})
    }
}

const delete_draft = async (req, res) => {
    try {
        if(req.jwt){
            const { email, owner, draft_id } = req.body;
            console.log(email, owner, draft_id);
            if(email !== req.jwt.email){
                return res.status(403).json({success:false, message:'UNAUTHORIZED'})
            } else{
                console.log('username matched !! finding user in mongo...')
                // now call mongo for the user get accecss token stored on mongo and compare
                const match = await userModel.findOne({email:email});
                if(match){
                    console.log('match found')
                    const access_token = req.headers.authorization.split(' ')[1];
                    if(jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET)){
                        console.log('access_tokens match!! creating new model')
                        // now you can add template
                        const draft = await draftModel.findOne({owner:owner});
                        if(draft){
                            console.log('Draft Document Found ->', draft?.drafts?.length)
                            draft.drafts.pull({_id: draft_id}) /* filter(item=>(item._id.toString() !== draft_id)); */
                            await draft.save();
                            res.status(200).json({success:true, message:'Success'});
                        } else {
                            res.status(403).json({success:false, message:'INVALID USER.'})
                        }
                    } else {
                        res.status(403).json({success:false, message:'TOKEN INVALID. UNAUTHORIZED.'})
                    }
                } else {
                    console.log('match NOT FOUND in mongo... ')
                    res.status(403).json({success:false, message:'UNAUTHORIZED'})
                }
            }
        } else {
            res.status(403).json({success:false, message:'UNAUTHORIZED'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message:'FAILED'})
    }
}

const delete_template_preview = async (req, res) => {
    try {
        if(!req.jwt) return res.status(403).json({success:false, message:'UNAUTHORIZED'});
        const {img_name} = req.body;
        let img_path = path.join(__dirname, '..', 'public', 'templates', img_name)
        if(fs.existsSync(img_path)){
            fs.unlinkSync(img_path)
            res.status(200).json({success:true, message:'Template preview deleted.'})
        } else {
            res.status(400).json({success:false, message:'File does not exist.'})
        }
    } catch (error) {
        res.status(500).json({success:false, message:'FAILED'})
    }
}

module.exports = { getLayoutData, getGmailData, create, getCategories, getTemplatesByCategory, getTemplates, getTemplateById, get_drafts, delete_draft, gmailAuth,  addSignToGmail, delete_template_preview}
