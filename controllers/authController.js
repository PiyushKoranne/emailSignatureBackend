const bcrypt = require('bcrypt');
const { userModel } = require('../models/userModel');
const jwt = require('jsonwebtoken')
const validator = require('email-validator');
const nodemailer = require('nodemailer')
const {passwordSchema} = require('../middlewares/validatePassword.js');
function generateFiveDigitRandomNumber() {
	const min = 10000; // Smallest 5-digit number (10000)
	const max = 99999; // Largest 5-digit number (99999)
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const refreshUser = async (req, res) => {
	try {
		console.log("#### REFRESH USER FUNCTION CALLED ####");
		const access_token = req.cookies['access_token'];
		console.log('Your Access Token',access_token)
		if(access_token){
			const decoded = jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET);
			if(decoded){
				const match = await userModel.findOne({email:decoded?.email});
				console.log(match);
				if(match && match?.is_logged_in){
					console.log('MATCH FOUND ->', match)
					res.status(200).json({ success: true, message: 'Logged refreshed Successfully', access_token: access_token, username: match.username, email: match.email, user_id: match._id, userData:match.userData, template_id:match.template_id, is_logged_in:match?.is_logged_in, template_id:match?.template_id });
				} else {
					console.log('403 First')
					res.clearCookie('access_token');
					res.clearCookie('jwt');
					res.status(403).json({message:'Please login again'})
				}
			} else{
				console.log('403 Secnd')
				res.clearCookie('access_token');
				res.clearCookie('jwt');
				res.status(403).json({message:"Please login again"})
			}
		} else{
			console.log('403 Thrid')
			res.clearCookie('access_token');
			res.clearCookie('jwt');
			res.status(403).json({message:'Please Login again.'})
		}
	} catch (error) {
		console.log('403 Fourth')
		console.log(error)
		res.clearCookie('access_token');
		res.clearCookie('jwt');
		res.status(500).json({message:error.message})
	}
}

const handleLogin = async (req, res) => {
	try {
		const { email, password, initial_code } = req.body;
		console.log('Trying to log in...', req.body);
		if (email === "" || password === "") {
			return res.status(400).json({ success: false, message: 'Email and/or password are required.' })
		}
		if (!validator.validate(email)) {
			return res.status(400).json({ success: true, message: 'Please provide a valid email address.' })
		}
		const match = await userModel.findOne({ email: email });
		if (!match) {
			console.log("No match found", email);
			return res.status(403).json({ success: false, message: 'Email or password incorrect' });
		} else {
			if (await bcrypt.compare(password, match.password)) {
				// generate an access_token and change status to true;
				const access_token = jwt.sign({ email: email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: 7200 }) // access token expires in 30m
			 	const refresh_token = jwt.sign({email:email, type:'REFRESH'}, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn:'1d'}) // refresh token expires in 1 day.
				match.is_logged_in = true;
				match.access_token = access_token;
				/**
				 * Only store data if the data exists, will come undefined if the user is new.
				 */
				if(req.body?.userData){
					console.log("\n\n\n\n\n\n\n THIS IS THE MODIFIED USER DATA GETTING STORED IN LOGIN ::",req.body?.userData, "\n\n\n\n\n\n\n");
						if(req.body?.userData?.fullName || req.body?.userData?.fullName === "") {
							match.userData.fullName = req.body?.userData?.fullName
						} else {
							match.userData.fullName = null
						}
						if(req.body?.userData?.logoName || req.body?.userData?.logoName === ""){ 
							match.userData.logoName = req.body?.userData?.logoName 
						} else {
							match.userData.logoName = null
						}
						if(req.body?.userData?.designation || req.body?.userData?.designation === ""){ 
							match.userData.designation = req.body?.userData?.designation 
						} else {
							match.userData.designation = null
						}
						if(req.body?.userData?.phone || req.body?.userData?.phone === ""){ 
							match.userData.phone = req.body?.userData?.phone 
						} else {
							match.userData.phone = null
						}
						if(req.body?.userData?.location || req.body?.userData?.location === ""){ 
							match.userData.location = req.body?.userData?.location 
						} else {
							match.userData.location = null
						}
						if(req.body?.userData?.email || req.body?.userData?.email === ""){ 
							match.userData.email = req.body?.userData?.email 
						} else {
							match.userData.email = null
						}
						if(req.body?.userData?.website || req.body?.userData?.website === ""){ 
							match.userData.website = req.body?.userData?.website 
						} else {
							match.userData.website = null
						}
						if(req.body?.userData?.profileImage || req.body?.userData?.profileImage === ""){ 
							match.userData.profileImage = req.body?.userData?.profileImage 
						} else {
							match.userData.profileImage = null
						}
						if(req.body?.userData?.banner || req.body?.userData?.banner === ""){ 
							match.userData.banner = req.body?.userData?.banner 
						} else {
							match.userData.banner = null
						}
						if(req.body?.userData?.facebook || req.body?.userData?.facebook === ""){ 
							match.userData.facebook = req.body?.userData?.facebook 
						} else {
							match.userData.facebook = null
						}
						if(req.body?.userData?.instagram || req.body?.userData?.instagram === ""){ 
							match.userData.instagram = req.body?.userData?.instagram 
						} else {
							match.userData.instagram = null
						}
						if(req.body?.userData?.youtube || req.body?.userData?.youtube === ""){ 
							match.userData.youtube = req.body?.userData?.youtube 
						} else {
							match.userData.youtube = null
						}
						if(req.body?.userData?.twitter || req.body?.userData?.twitter === ""){ 
							match.userData.twitter = req.body?.userData?.twitter 
						} else {
							match.userData.twitter = null
						}
						if(req.body?.userData?.linkedIn || req.body?.userData?.linkedIn === ""){ 
							match.userData.linkedIn = req.body?.userData?.linkedIn 
						} else {
							match.userData.linkedIn = null
						}
						if(req.body?.userData?.pinterest || req.body?.userData?.pinterest === ""){ 
							match.userData.pinterest = req.body?.userData?.pinterest 
						} else {
							match.userData.pinterest = null
						}
						if(req.body?.userData?.skype || req.body?.userData?.skype === ""){ 
							match.userData.skype = req.body?.userData?.skype 
						} else {
							match.userData.skype = null
						}
						if(req.body?.userData?.whatsapp || req.body?.userData?.whatsapp === ""){ 
							match.userData.whatsapp = req.body?.userData?.whatsapp 
						} else {
							match.userData.whatsapp = null
						}
						if(req.body?.userData?.disclaimer || req.body?.userData?.disclaimer === ""){ 
							match.userData.disclaimer = req.body?.userData?.disclaimer 
						} else {
							match.userData.disclaimer = null
						}
						if(req.body?.userData?.video || req.body?.userData?.video === ""){ 
							match.userData.video = req.body?.userData?.video 
						} else {
							match.userData.video = null
						}
						if(req.body?.userData?.quote || req.body?.userData?.quote === ""){ 
							match.userData.quote = req.body?.userData?.quote 
						} else {
							match.userData.quote = null
						}
						if(req.body?.userData?.playStoreAppLink || req.body?.userData?.playStoreAppLink === ""){ 
							match.userData.playStoreAppLink = req.body?.userData?.playStoreAppLink 
						} else {
							match.userData.playStoreAppLink = null
						}
						if(req.body?.userData?.appleStoreAppLink || req.body?.userData?.appleStoreAppLink === ""){ 
							match.userData.appleStoreAppLink = req.body?.userData?.appleStoreAppLink 
						} else {
							match.userData.appleStoreAppLink = null
						}
						if(req.body?.userData?.feedback || req.body?.userData?.feedback === ""){ 
							match.userData.feedback = req.body?.userData?.feedback 
						} else {
							match.userData.feedback = null
						}
						if(req.body?.userData?.visited?.profile || req.body?.userData?.visited?.profile === ""){ 
							match.userData.visited.profile =  req.body?.userData?.visited?.profile 
						} else {
							match.userData.visited.profile = null
						}
						if(req.body?.userData?.visited?.details || req.body?.userData?.visited?.details === ""){ 
							match.userData.visited.details =  req.body?.userData?.visited?.details 
						} else {
							match.userData.visited.details = null
						}
						if(req.body?.userData?.visited?.social || req.body?.userData?.visited?.social === ""){ 
							match.userData.visited.social =  req.body?.userData?.visited?.social 
						} else {
							match.userData.visited.social = null
						}
						if(req.body?.userData?.visited?.cta || req.body?.userData?.visited?.cta === ""){ 
							match.userData.visited.cta =  req.body?.userData?.visited?.cta 
						} else {
							match.userData.visited.cta = null
						}
				}
				if(req.body?.template_id) match.template_id = req.body.template_id;
				await match.save();

				res.cookie('access_token', access_token, {
				     httpOnly:true,
					 sameSite:'none',
				     maxAge:24*60*60*1000,
				     secure:true
				 }); // send a cookie containing refresh token, make sure to set credentials true in axios when making request to get the cookie to backend
				res.cookie('jwt', refresh_token, {
					httpOnly:true,
					sameSite:'None',
					maxAge:24*60*60*1000,
					secure:true
				 }); // send a cookie containing refresh token, make sure to set credentials true in axios when making request to get the cookie to backend
				res.status(200).json({ success: true, message: 'Logged In Successfully', access_token: access_token, username: match.username, email: match.email, user_id: match._id, userData:match.userData, newUser:match.new_user, template_id:match.template_id });
			} else {
				console.log("Bcrypt Password comparison failed");
				res.status(403).json({ success: false, message: 'Username or password incorrect' });
			}
		}

	} catch (error) {
		console.log(error)
		res.status(500).json({ success: true, message: 'SERVER ERROR' })
	}
}

const addUserData = async (req, res) => {
	try {
		if (req.jwt) {
			const { email, owner } = req.body;
			console.log(req.body);
			console.log(req.headers);
			if (email !== req.jwt.email) {
				return res.status(403).json({ success: false, message: 'UNAUTHORIZED' })
			} else {
				console.log('username matched !! finding user in mongo...')
				// now call mongo for the user get accecss token stored on mongo and compare
				const match = await userModel.findOne({ email: email });
				if (match) {
					console.log('match found')
					console.log(match)
						const access_token = req.headers?.authorization?.split(" ")[1];
						if(jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET)){
							if(req.body?.userData){
								if(req.body?.userData?.fullName || req.body?.userData?.fullName === "") {
									match.userData.fullName = req.body?.userData?.fullName
								} else {
									match.userData.fullName = null
								}
								if(req.body?.userData?.logoName || req.body?.userData?.logoName === ""){ 
									match.userData.logoName = req.body?.userData?.logoName 
								} else {
									match.userData.logoName = null
								}
								if(req.body?.userData?.designation || req.body?.userData?.designation === ""){ 
									match.userData.designation = req.body?.userData?.designation 
								} else {
									match.userData.designation = null
								}
								if(req.body?.userData?.phone || req.body?.userData?.phone === ""){ 
									match.userData.phone = req.body?.userData?.phone 
								} else {
									match.userData.phone = null
								}
								if(req.body?.userData?.location || req.body?.userData?.location === ""){ 
									match.userData.location = req.body?.userData?.location 
								} else {
									match.userData.location = null
								}
								if(req.body?.userData?.email || req.body?.userData?.email === ""){ 
									match.userData.email = req.body?.userData?.email 
								} else {
									match.userData.email = null
								}
								if(req.body?.userData?.website || req.body?.userData?.website === ""){ 
									match.userData.website = req.body?.userData?.website 
								} else {
									match.userData.website = null
								}
								if(req.body?.userData?.profileImage || req.body?.userData?.profileImage === ""){ 
									match.userData.profileImage = req.body?.userData?.profileImage 
								} else {
									match.userData.profileImage = null
								}
								if(req.body?.userData?.banner || req.body?.userData?.banner === ""){ 
									match.userData.banner = req.body?.userData?.banner 
								} else {
									match.userData.banner = null
								}
								if(req.body?.userData?.facebook || req.body?.userData?.facebook === ""){ 
									match.userData.facebook = req.body?.userData?.facebook 
								} else {
									match.userData.facebook = null
								}
								if(req.body?.userData?.instagram || req.body?.userData?.instagram === ""){ 
									match.userData.instagram = req.body?.userData?.instagram 
								} else {
									match.userData.instagram = null
								}
								if(req.body?.userData?.youtube || req.body?.userData?.youtube === ""){ 
									match.userData.youtube = req.body?.userData?.youtube 
								} else {
									match.userData.youtube = null
								}
								if(req.body?.userData?.twitter || req.body?.userData?.twitter === ""){ 
									match.userData.twitter = req.body?.userData?.twitter 
								} else {
									match.userData.twitter = null
								}
								if(req.body?.userData?.linkedIn || req.body?.userData?.linkedIn === ""){ 
									match.userData.linkedIn = req.body?.userData?.linkedIn 
								} else {
									match.userData.linkedIn = null
								}
								if(req.body?.userData?.pinterest || req.body?.userData?.pinterest === ""){ 
									match.userData.pinterest = req.body?.userData?.pinterest 
								} else {
									match.userData.pinterest = null
								}
								if(req.body?.userData?.skype || req.body?.userData?.skype === ""){ 
									match.userData.skype = req.body?.userData?.skype 
								} else {
									match.userData.skype = null
								}
								if(req.body?.userData?.whatsapp || req.body?.userData?.whatsapp === ""){ 
									match.userData.whatsapp = req.body?.userData?.whatsapp 
								} else {
									match.userData.whatsapp = null
								}
								if(req.body?.userData?.disclaimer || req.body?.userData?.disclaimer === ""){ 
									match.userData.disclaimer = req.body?.userData?.disclaimer 
								} else {
									match.userData.disclaimer = null
								}
								if(req.body?.userData?.video || req.body?.userData?.video === ""){ 
									match.userData.video = req.body?.userData?.video 
								} else {
									match.userData.video = null
								}
								if(req.body?.userData?.quote || req.body?.userData?.quote === ""){ 
									match.userData.quote = req.body?.userData?.quote 
								} else {
									match.userData.quote = null
								}
								if(req.body?.userData?.playStoreAppLink || req.body?.userData?.playStoreAppLink === ""){ 
									match.userData.playStoreAppLink = req.body?.userData?.playStoreAppLink 
								} else {
									match.userData.playStoreAppLink = null
								}
								if(req.body?.userData?.appleStoreAppLink || req.body?.userData?.appleStoreAppLink === ""){ 
									match.userData.appleStoreAppLink = req.body?.userData?.appleStoreAppLink 
								} else {
									match.userData.appleStoreAppLink = null
								}
								if(req.body?.userData?.feedback || req.body?.userData?.feedback === ""){ 
									match.userData.feedback = req.body?.userData?.feedback 
								} else {
									match.userData.feedback = null
								}
								if(req.body?.userData?.visited?.profile || req.body?.userData?.visited?.profile === ""){ 
									match.userData.visited.profile =  req.body?.userData?.visited?.profile 
								} else {
									match.userData.visited.profile = null
								}
								if(req.body?.userData?.visited?.details || req.body?.userData?.visited?.details === ""){ 
									match.userData.visited.details =  req.body?.userData?.visited?.details 
								} else {
									match.userData.visited.details = null
								}
								if(req.body?.userData?.visited?.social || req.body?.userData?.visited?.social === ""){ 
									match.userData.visited.social =  req.body?.userData?.visited?.social 
								} else {
									match.userData.visited.social = null
								}
								if(req.body?.userData?.visited?.cta || req.body?.userData?.visited?.cta === ""){ 
									match.userData.visited.cta =  req.body?.userData?.visited?.cta 
								} else {
									match.userData.visited.cta = null
								}
								// if(req.body?.userData?.fullName || req.body?.userData?.fullName === "") match.userData.fullName = req.body?.userData?.fullName 
								// if(req.body?.userData?.logoName || req.body?.userData?.logoName === "") match.userData.logoName = req.body?.userData?.logoName 
								// if(req.body?.userData?.designation || req.body?.userData?.designation === "") match.userData.designation = req.body?.userData?.designation 
								// if(req.body?.userData?.phone || req.body?.userData?.phone === "") match.userData.phone = req.body?.userData?.phone 
								// if(req.body?.userData?.location || req.body?.userData?.location === "") match.userData.location = req.body?.userData?.location 
								// if(req.body?.userData?.email || req.body?.userData?.email === "") match.userData.email = req.body?.userData?.email 
								// if(req.body?.userData?.website || req.body?.userData?.website === "") match.userData.website = req.body?.userData?.website 
								// if(req.body?.userData?.profileImage || req.body?.userData?.profileImage === "") match.userData.profileImage = req.body?.userData?.profileImage 
								// if(req.body?.userData?.logoImage || req.body?.userData?.logoImage === "") match.userData.logoImage = req.body?.userData?.logoImage 
								// if(req.body?.userData?.facebook || req.body?.userData?.facebook === "") match.userData.facebook = req.body?.userData?.facebook 
								// if(req.body?.userData?.instagram || req.body?.userData?.instagram === "") match.userData.instagram = req.body?.userData?.instagram 
								// if(req.body?.userData?.youtube || req.body?.userData?.youtube === "") match.userData.youtube = req.body?.userData?.youtube 
								// if(req.body?.userData?.twitter || req.body?.userData?.twitter === "") match.userData.twitter = req.body?.userData?.twitter 
								// if(req.body?.userData?.linkedIn || req.body?.userData?.linkedIn === "") match.userData.linkedIn = req.body?.userData?.linkedIn 
								// if(req.body?.userData?.pinterest || req.body?.userData?.pinterest === "") match.userData.pinterest = req.body?.userData?.pinterest 
								// if(req.body?.userData?.skype || req.body?.userData?.skype === "") match.userData.skype = req.body?.userData?.skype 
								// if(req.body?.userData?.whatsapp || req.body?.userData?.whatsapp === "") match.userData.whatsapp = req.body?.userData?.whatsapp 
								// if(req.body?.userData?.disclaimer || req.body?.userData?.disclaimer === "") match.userData.disclaimer = req.body?.userData?.disclaimer 
								// if(req.body?.userData?.video || req.body?.userData?.video === "") match.userData.video = req.body?.userData?.video 
								// if(req.body?.userData?.quote || req.body?.userData?.quote === "") match.userData.quote = req.body?.userData?.quote 
								// if(req.body?.userData?.playStoreAppLink || req.body?.userData?.playStoreAppLink === "") match.userData.playStoreAppLink = req.body?.userData?.playStoreAppLink 
								// if(req.body?.userData?.appleStoreAppLink || req.body?.userData?.appleStoreAppLink === "") match.userData.appleStoreAppLink = req.body?.userData?.appleStoreAppLink 
								// if(req.body?.userData?.feedback || req.body?.userData?.feedback === "") match.userData.feedback = req.body?.userData?.feedback 
								// if(req.body?.userData?.visited?.profile || req.body?.userData?.visited?.profile === "") match.userData.visited.profile =  req.body?.userData?.visited?.profile 
								// if(req.body?.userData?.visited?.details || req.body?.userData?.visited?.details === "") match.userData.visited.details = req.body?.userData?.visited?.details 
								// if(req.body?.userData?.visited?.social || req.body?.userData?.visited?.social === "") match.userData.visited.social = req.body?.userData?.visited?.social 
								// if(req.body?.userData?.visited?.cta || req.body?.userData?.visited?.cta === "") match.userData.visited.cta = req.body?.userData?.visited?.cta 
						}
							if(req.body?.template_id) match.template_id = req.body.template_id;
							await match.save();
							res.status(200).json({success:true, message:'Data saved.'})
						}
						// now you can add userdata

				} else {
					console.log('match NOT FOUND in mongo... ')
					res.status(403).json({ success: false, message: 'UNAUTHORIZED' })
				}
			}
		} else {
			res.status(403).json({ success: false, message: 'UNAUTHORIZED' })
		}
	} catch (error) {
		console.log(error)
		res.status(400).json({success:false, message:'Failed to add user data to profile'})
	}
}

function sendVerificationOTP(email, initial_code, req, res) {
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
		subject: 'Welcome to Email Signature',
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
																 <td style="width:100%;max-width:531px;font-family:Roboto,arial;font-weight:500;font-size:14px;color:rgb(255,255,255);letter-spacing:0.6px;border-collapse:collapse;padding-top:33px" align="left" width="531">New User registered, Email Signature.</td>
															  </tr>
														   </tbody>
														</table>
													 </span>
													 <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px" border="0" width="600" cellspacing="0" cellpadding="0">
														<tbody>
														   <tr>
															  <td style="width:100%;max-width:531px;border-collapse:collapse;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px;padding:13px 12px 24px 40px" align="left" width="531">&nbsp; Welcome : Registration Successful.</td>
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
																 <p>Please use this code to verify your email during your first login <strong>${initial_code}</strong>. This will only be required this time.</p>
																 <p style="color:rgb(69,90,100);font-weight:normal">Warm welcome to Email Signature. Today a good introduction can create a lasting impression. We strive to enable our users to make their best impression that truly compliments who they are. We are excited to serve you and ensure that you get the best curated and handpicked email signature for your specific needs. Email Signature is a platform that provides high quality, versatile and elegant Email Signature to its users.  &nbsp;</p>
																 <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)"><strong>Salient Features:&nbsp;&nbsp;</strong></span></p>
																 <ul style="color:rgb(69,90,100)">
																	<li>More than 35000 templates to choose from.&nbsp;</li>
																	<li>Highly customisable Email Signature.</li>
																	<li>Categories catering to Corporate, small businesses and artists alike.</li>
																 </ul>
																 <p style="color:rgb(69,90,100)">Let's jump right into the world of signature templates.&nbsp;</p>
																 <p style="color:rgb(69,90,100);font-weight:normal">Thank you for your patience.&nbsp;For more information regarding Email Signature process, you may refer to the <a href="emailsignature.react.stagingwebsite.co.in" rel="noopener" target="_blank">Email Signature FAQs</a>.</p>
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
		if(err) {
			console.log('Failed To Send Welcome Email',err);
			res.status(400).json({success:false, message:"Unable to send OTP. Please check the email address provided by you."})
		}
		else {
			console.log('Welcome Email Sent!')
			res.status(200).json({success:true, message:"Verification OTP has been sent to your email address."})
		}
	});
}

const verifyEmail = async (req, res) => {
	try {
		const {email} = req.body;
		if(!email) {
			return res.status(400).json({ success: true, message: 'Email address is required.' })
		}
		if (!validator.validate(email)) {
			return res.status(400).json({ success: true, message: 'Please provide a valid email address.' })
		} 
		const initial_code = generateFiveDigitRandomNumber();
		const match = await userModel.findOne({ email: email });
		if(match){
			if(match?.initial_login_status && match?.password === "VERIFICATION_PENDING"){
				match.initial_login_key = initial_code;
				await match.save();
				//send email 
				sendVerificationOTP(email, initial_code, req, res);
			} else {
				res.status(400).json({success:false, message:"User Already Registered."})
			}
		} else {
			const new_user = new userModel({
				username: email.split('@')[0],
				email: email,
				password: "VERIFICATION_PENDING",
				initial_login_key:initial_code,
				initial_login_status:true,
			});
			await new_user.save();
			// send Email.
			sendVerificationOTP(email, initial_code, req, res);
			
		}
		
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:"Server is experiencing some errors."})
	}
}

const verifyOTP = async (req, res) => {
	try {
		const match = await userModel.findOne({email:req.body?.email});
		if(!match){
			res.status(400).json({success:false, message:"Email not registered."})
		} else if(match?.initial_login_status && match?.password === "VERIFICATION_PENDING"){
			if(parseInt(req.body?.initial_code) === match?.initial_login_key){
				match.initial_login_key = 0;
				match.new_user = true;
				await match.save();
				res.status(200).json({success:false, message:"OTP Verified"});
			} else if(match?.initial_login_key === 0 && match?.initial_login_status === false){
				if(match?.password === "VERIFICATION_PENDING"){
					res.status(400).json({success:false, passwordNotSet:true, message:"Email Verified! Please Reset Your Password."})
				} else {
					res.status(400).json({success:false, message:"Email Already Verified."})
				}
			} else {
				res.status(400).json({success:false, message:"OTP not matched: Please Enter the correct OTP."})
			}
		} else if(!match?.initial_login_status && match.initial_login_key === 0){
			res.status(400).json({success:false, message:'OTP Already Verified'})
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({sucess:false, message:"Server Error"})
	}
}

const handleRegister = async (req, res) => {
	try {
		const { email, password, initial_code } = req.body;
		console.log(email, password)
		if (password === "" || email === "") {
			return res.status(400).json({ success: false, message: 'Email and/or password are required.' })
		}
		if (!validator.validate(email)) {
			return res.status(400).json({ success: true, message: 'Please provide a valid email address.' })
		}
		if(!passwordSchema.validate(password)){
			return res.status(400).json({ success: true, message: 'Password doesn\'t match criteria.' })
		}
		const match = await userModel.findOne({ email: email });
		if (match) {
				if(match?.initial_login_key === 0){
					match.initial_login_status = false;
					const hash = await bcrypt.hash(password, 10);
					match.password = hash;
					match.new_user = true;
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
						subject: 'Welcome to Email Signature',
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
																				 <td style="width:100%;max-width:531px;font-family:Roboto,arial;font-weight:500;font-size:14px;color:rgb(255,255,255);letter-spacing:0.6px;border-collapse:collapse;padding-top:33px" align="left" width="531">New User registered, Email Signature.</td>
																			  </tr>
																		   </tbody>
																		</table>
																	 </span>
																	 <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px" border="0" width="600" cellspacing="0" cellpadding="0">
																		<tbody>
																		   <tr>
																			  <td style="width:100%;max-width:531px;border-collapse:collapse;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px;padding:13px 12px 24px 40px" align="left" width="531">&nbsp; Welcome : Registration Successful.</td>
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
																				 <p style="color:rgb(69,90,100);font-weight:normal">Warm welcome to Email Signature. Today a good introduction can create a lasting impression. We strive to enable our users to make their best impression that truly compliments who they are. We are excited to serve you and ensure that you get the best curated and handpicked email signature for your specific needs. Email Signature is a platform that provides high quality, versatile and elegant Email Signature to its users.  &nbsp;</p>
																				 <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)"><strong>Salient Features:&nbsp;&nbsp;</strong></span></p>
																				 <ul style="color:rgb(69,90,100)">
																					<li>More than 35000 templates to choose from.&nbsp;</li>
																					<li>Highly customisable Email Signature.</li>
																					<li>Categories catering to Corporate, small businesses and artists alike.</li>
																				 </ul>
																				 <p style="color:rgb(69,90,100)">Let's jump right into the world of signature templates.&nbsp;</p>
																				 <p style="color:rgb(69,90,100);font-weight:normal">Thank you for your patience.&nbsp;For more information regarding Email Signature process, you may refer to the <a href="emailsignature.react.stagingwebsite.co.in" rel="noopener" target="_blank">Email Signature FAQs</a>.</p>
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
				if(err) {
					console.log('Failed To Send Welcome Email',err);
					res.status(400).json({success:false, message:"Please enter a valid email address."})

				}
				else {	
					console.log('Welcome Email Sent!')
					res.status(200).json({success:true, message:"User Registered Successfully."})
				}
				
				})
				} else{
					res.status(400).json({success:false, message:"OTP entered is incorrect. Please retry."})
				}
		} else {
			res.status(400).json({success:false, message:"Please verify your email first.", verify:true})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: 'SERVER ERROR' })
	}
}

const refreshToken = async (req, res) => {
	try{
		// get a refresh token in the cookie
		console.log('####### ALL COOKIES #######\n');
		console.log(req.cookies);
		const refresh_token = req.cookies['jwt'];
		console.log('Trying to Refresh -> \n refresh_token :', refresh_token);
		if(refresh_token){
			const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN_SECRET);
			console.log('Decoded Token: ', decoded);
			const match = await userModel.findOne({email: decoded.email});
			if(!match) throw new Error('Token Invalid. Login Again');
			const new_access_token = jwt.sign({ email: match.email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: 1800 });
			match.access_token = new_access_token;
			match.is_logged_in = true;
			await match.save();
			res.status(200).json({ success: true, message: 'Logged In Successfully', access_token: new_access_token, username: match.username, email: match.email, user_id: match._id, userData:match.userData, newUser:match.new_user, template_id:match.template_id });
		} else {
			// throw error and ask to login again
			throw new Error('Token not found');
		}
	} catch(error){
		console.log(error);
		res.status(400).json({success:false, message: 'Token Expired. Please Login Again'});
	}
}

const handleLogout = async (req, res) => {
	try {
		const match = await userModel.findOne({ email: req.body.email });
		res.clearCookie('access_token');
		res.clearCookie('jwt');
		if (req.jwt.email !== req.body.email) return res.status(403).json({ success: false, message: "UNAUTHORIZED. INVALID TOKEN." })
		if (match) {
			console.log('Match found');
			match.is_logged_in = false;
			match.access_token = 'NOT_LOGGED';
			console.log('match', match);
			await match.save();
			req.session.destroy();
			res.status(200).json({ success: true, message: 'Logged Out Successfully' });
		} else {
			res.status(400).json({ success: false, message: 'INVALID REQUEST' })
		}
	} catch {
		res.status(500).json({ success: false, message: 'SERVER ERROR' })
	}

}

const validate = async (req, res) => {
	try {
		if (req.jwt) {
			const { email, owner } = req.body;
			if (email !== req.jwt.email) {
				return res.status(403).json({ success: false, message: 'UNAUTHORIZED' })
			} else {
				console.log('username matched !! finding user in mongo...')
				// now call mongo for the user get accecss token stored on mongo and compare
				const match = await userModel.findOne({ email: email });
				if (match) {
					console.log('match found')
					if (match.access_token === req.headers.authorization.split(' ')[1] || match.access_token === req.headers.Authorization.split(' ')[1]) {
						console.log('access_tokens match!! creating new model')
						// now you can add template
						res.status(200).json({ success: true, message: 'Valid' });
					} else {
						res.status(403).json({ success: false, message: 'TOKEN INVALID. UNAUTHORIZED.' })
					}
				} else {
					console.log('match NOT FOUND in mongo... ')
					res.status(403).json({ success: false, message: 'UNAUTHORIZED' })
				}
			}
		} else {
			res.status(403).json({ success: false, message: 'UNAUTHORIZED' })
		}
	} catch (error) {
		res.status(500).json({ success: false, message: 'FAILED' })
	}
}
const forgotPasswordRender = async (req, res) => {
	console.log(req.query.token);
	return res.render('forgot', { 
		message: "", 
		token: req.query?.token || 'NOT_FOUND', 
		email: req.query.email, 
		logoUrl: '/logo/Email_Sign_Logo.svg' 
	})
}
const changePassword = async (req, res) => {
	try {
		console.log('INSIDE CHANGE PASSWORD')
		if (!req.body?.otp || !req.body?.email) return;
		else {
			// find the user match
			const match = await userModel.findOne({ email: req.body?.email });
			if (match) {
				const decoded = jwt.verify(match.forgot_token, process.env.JWT_ACCESS_TOKEN_SECRET)
				if(!decoded){
					res.status(400).json({message:'OTP TOKEN INVALID'})
				} else {
					console.log('decoded', decoded, typeof(decoded.otp));
					console.log('otp', req.body.otp, typeof(req.body.otp))
					if (decoded.otp === req.body?.otp){
						if (req.body.new_password === req.body.confirm_password) {
							// save new pswd to mongo
							const hash = await bcrypt.hash(req.body.new_password, 10);
							match.password = hash;
							match.forgot_token = "";
							await match.save();
							return res.status(200).json({message:"Password Changed Successfully!"})
						} else {
							return res.status(400).json({message:"Passwords don't match."})
						}
					} else {
						res.status(403).json({message:"OTP is incorrect. Please enter a valid OTP."})
					}
				}
				
			} else {
				res.status(400).json({message:"INVALID USER"})
			}
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'FAILED' })
	}
}

const handleForgotPassword = async (req, res) => {
	try {
		// get the email send by user from frontend
		const { email } = req.body;
		console.log(req.body)
		if (email === "") {
			return res.status(400).json({ success: false, message: 'Email and/or password are required.' })
		}
		if (!validator.validate(email)) {
			console.log('Inside Validator', email)
			return res.status(400).json({ success: true, message: 'Please provide a valid email address.' })
		}
		const match = await userModel.findOne({ email: email });
		//check if the email exists in mongo
		if (match) {
			const min = 10000;
			const max = 99999;
			const otp = Math.floor(Math.random() * (max - min + 1)) + min;
			const forgot_token = jwt.sign({otp:`${otp}`}, process.env.JWT_ACCESS_TOKEN_SECRET);
			match.forgot_token = forgot_token;
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
				subject: 'Email Signature: Your Login Credentials',
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
                                                            <td style="width:100%;max-width:531px;font-family:Roboto,arial;font-weight:500;font-size:14px;color:rgb(255,255,255);letter-spacing:0.6px;border-collapse:collapse;padding-top:33px" align="left" width="531">Authentication Process Initiated, Email Signature.</td>
                                                         </tr>
                                                      </tbody>
                                                   </table>
                                                </span>
                                                <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px" border="0" width="600" cellspacing="0" cellpadding="0">
                                                   <tbody>
                                                      <tr>
                                                         <td style="width:100%;max-width:531px;border-collapse:collapse;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px;padding:13px 12px 24px 40px" align="left" width="531">&nbsp; Verification Update : Login OTP.</td>
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
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Warm welcome to Email Signature. We are excited to serve you. To securely reset your account password, please enter the following OTP on the web application. This OTP is valid only for five minutes. Please don't share this OTP with anyone.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)"><strong>OTP : ${otp}&nbsp;&nbsp;</strong></span></p>
                                                            
                                                            <p style="color:rgb(69,90,100)">After this OTP is expired, a new OTP request will be created for each new login attempt, and we will reach out via email.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Thank you for your patience.&nbsp;For more information regarding Email Signature process, you may refer to the <a href="${process.env.FRONTEND_URL}" rel="noopener" target="_blank">Email Signature FAQs</a>.</p>
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
			};

			mailTransporter.sendMail(mailDetails, function (err, data) {
				if (err) {
					console.log('Error Occurs');
					res.status(400).json({ success: false, message: 'Failed To Send Mail' })

				} else {
					console.log('Email sent successfully');
					res.status(200).json({ success: false, message: 'Email sent successfully' })

				}
			});

		} else {
			return res.status(400).json({ success: true, message: 'Please provide a valid email address.' })
		}
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'FAILED' })
	}
}
const sendOTPonMail = async (req, res) => {
	try {
		const { email } = req.body;
		// find the matching user in db
		const match = await userModel.findOne({ email: email });
		if (match) {
			const otp = Math.floor(Math.random() * 90000) + 10000;
			const otp_token = jwt.sign({ otp: otp }, process.env.JWT_OTP_TOKEN_SECRET, { expiresIn: 300 }) // token expres in 5 min so does otp
			match.otp_token = otp_token;
			await match.save(); // save otp token in mongo

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
				subject: 'Email Signature: Your Login Credentials',
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
                                                            <td style="width:100%;max-width:531px;font-family:Roboto,arial;font-weight:500;font-size:14px;color:rgb(255,255,255);letter-spacing:0.6px;border-collapse:collapse;padding-top:33px" align="left" width="531">Authentication Process Initiated, Email Signature.</td>
                                                         </tr>
                                                      </tbody>
                                                   </table>
                                                </span>
                                                <table style="background-color:#525FE1;max-width:600px;border-collapse:collapse;width:100%;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px" border="0" width="600" cellspacing="0" cellpadding="0">
                                                   <tbody>
                                                      <tr>
                                                         <td style="width:100%;max-width:531px;border-collapse:collapse;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px;padding:13px 12px 24px 40px" align="left" width="531">&nbsp; Verification Update : Login OTP.</td>
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
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Warm welcome to Email Signature. We are excited to serve you. To securely login into your account, please enter the following OTP on the web application. This OTP is valid only for five minutes. Please don't share this OTP with anyone.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)"><strong>OTP : ${otp}&nbsp;&nbsp;</strong></span></p>
                                                            
                                                            <p style="color:rgb(69,90,100)">After this OTP is expired, a new OTP request will be created for each new login attempt, and we will reach out via email.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Thank you for your patience.&nbsp;For more information regarding Email Signature process, you may refer to the <a href="${process.env.FRONTEND_URL}" rel="noopener" target="_blank">Email Signature FAQs</a>.</p>
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
			};

			mailTransporter.sendMail(mailDetails, function (err, data) {
				if (err) {
					console.log('Error Occurs');
					res.status(400).json({ success: false, message: 'Failed To Send Mail' })

				} else {
					console.log('Email sent successfully');
					res.status(200).json({ success: false, message: 'Email sent successfully' })

				}
			});
		} else {
			res.status(400).json({ success: false, message: 'User Does Not Exist' })
		}
	} catch (error) {
		res.status(500).json({ success: false, message: 'FAILED' })
	}
}

const loginWithOTP = async (req, res) => {
	try {
		console.log('loginWithOTP callled');
		const { email, otp } = req.body;
		console.log(email, otp);
		if (!email || !otp) return res.status(400).json({ success: false, message: 'Email or OTP is required.' });
		// find match in db
		const match = await userModel.findOne({ email: email });
		if (match) {
			console.log('match found');
			if (!match.otp_token) return res.status(400).json({ success: false, message: 'OTP does not exist. Please Re-generate the OTP.' })
			const decoded = jwt.verify(match.otp_token, process.env.JWT_OTP_TOKEN_SECRET);
			console.log(decoded);
			if (decoded) {
				if (decoded?.otp === parseInt(otp)) {

					console.log('OTP Success.')
					const access_token = jwt.sign({ email: email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: 1800 }) // access token expires in 30m
					const refresh_token = jwt.sign({email:email, type:'REFRESH'}, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn:'1d'})
					match.is_logged_in = true;
					match.access_token = access_token;
					if(req.body?.userData) match.userData = req.body.userData;
					if(req.body?.template_id) match.template_id = req.body.template_id;
					await match.save();
					res.cookie('jwt', refresh_token, {
				    	httpOnly:true,
		     	    	sameSite:'None',
				     	maxAge:24*60*60*1000,
				     	secure:true
					}); 
					res.status(200).json({ success: true, message: 'Logged In Successfully', access_token: access_token, username: match.username, email: match.email, user_id: match._id, userData:match?.userData, newUser:match?.new_user, template_id:match.template_id })
				} else {
					res.status(403).json({ success: false, message: 'OTP is incorrect' })
				}
			} else {
				res.status(400).json({ success: false, message: 'Invalid OTP' })
			}
		} else {
			res.status(400).json({ success: false, message: 'User does not exist' });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: 'FAILED' })
	}
}

module.exports = { refreshUser, verifyOTP, handleLogin, addUserData, handleRegister, verifyEmail, handleLogout, refreshToken, validate, sendOTPonMail, loginWithOTP, handleForgotPassword, forgotPasswordRender, changePassword }
