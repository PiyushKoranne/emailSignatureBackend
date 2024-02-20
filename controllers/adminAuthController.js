const jwt = require('jsonwebtoken');
const validator = require('email-validator');
const nodemailer = require('nodemailer')
const session = require('express-session');
const {adminModel} = require('../models/adminModel');
const {templateModel} = require('../models/templateModel');
const {userModel} = require('../models/userModel');
const {draftModel} = require('../models/draftModel');
const bcrypt = require('bcrypt');


const handleLogin = async (req, res) => {
	try {
        const { email, password, remember } = req.body;
        console.log('Logging In : ', email, password);
        if(email === "" || password === ""){
	    req.flash('message',{type:'success', value:'Email or password is required'})
            return res.redirect('/');
        }
		
        const match = await adminModel.findOne({email:email});
        if (!match) {
	    req.flash('message',{type:'failure', value:'Email or password is incorrect'})
            return res.redirect('/')
        } else {
            console.log('match found', match);
            if (await bcrypt.compare(password, match.password)) {
                console.log('passwords matched...')
                // generate an access_token and change status to true;
				req.session.user_id = match._id;
				req.session.logged_in = true;
				req.session.username = match.username;
				req.session.email = match.email;
				req.session.role = match.role;
				if(remember){ 
					req.session.cookie.maxAge = 6*60*60*1000;
				}else{ 
					req.session.cookie.expires = false;
				}

				req.flash('message', {type:'success', value:`Welcome ${match.username}`});

                const access_token = jwt.sign({ email: email, role: match.role }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
                match.is_logged_in = true;
                match.access_token = access_token;
				req.session.access_token = access_token;
                console.log(match)
                await match.save();
				console.log("ACCESS TOKEN CREATED", access_token);
				console.log("Saved the match")
				//get overview data for the render 
				return res.redirect('/dashboard');

            } else {
                console.log('no match')
				req.flash('message',{type:'failure', value:'Email or password is incorrect'})
                return res.redirect('/')
            }
        }

    } catch (error) {
        console.log(error);
	req.flash('message', {type:'failure', value:error.message})
        res.redirect('/')
    }
}

const forgotPasswordRender = async (req, res) => {
	try {
		return res.render('changepswdpage', {
			logoUrl:'/logo/Email_Sign_Logo.svg',
			message:req.flash('message'),
			token: req.query?.token || 'NOT_FOUND',
			email: req.query.email,
		})
	} catch (error) {
		console.log("ERROR WHILE CHANGING PASSWORD", error)
	}
}

const changePassword = async (req, res) => {
	try {
		console.log('INSIDE CHANGE PASSWORD')
		if (!req.body?.token || !req.body?.email) return;
		else {
			// find the user match
			const match = await adminModel.findOne({ email: req.body?.email });
			if (match) {
				const decoded = jwt.verify(req.body?.token, process.env.JWT_ACCESS_TOKEN_SECRET);
				if (!decoded || decoded.email != req.body.email ) return res.render('changepswdpage', {
					message: "TOKEN INVALID",
					token: req.query?.token || 'NOT_FOUND',
					email: req.query.email,
					logoUrl: '/logo/Email_Sign_Logo.svg'
				})
				if (req.body.password === req.body.confirm_password) {
					// save new pswd to mongo
					console.log('setting new password as : ', req.body.password);
					const hash = await bcrypt.hash(req.body.password, 10);
					match.password = hash;
					await match.save();
					req.flash('message', {type:'success', value:'Password Changed successfully'});
					return res.redirect('/');
				} else {
					req.flash('message', {type:'failure', value:'Passwords do not match.'});
					return res.render('changepswdpage', {
						message: req.flash('message'),
						token: req.query?.token || 'NOT_FOUND',
						email: req.query.email,
						logoUrl: '/logo/Email_Sign_Logo.svg'
					})
				}
			} else {
				req.flash('message', {type:'failure', value:'Invalid Token. Please re-initiate the process.'});
				return res.render('changepswdpage', {
					message: req.flash('message'),
					token: req.query?.token || 'NOT_FOUND',
					email: req.query.email,
					logoUrl: '/logo/Email_Sign_Logo.svg'
				})	
			}
		}
	} catch (error) {
		console.log("CHANGE PASSWRD ERROR ==>",error);
		req.flash('message', {type:'failure', value:error?.message});
		return res.render('changepswdpage', {
			message: req.flash('message'),
			token: req.query?.token || 'NOT_FOUND',
			email: req.query.email,
			logoUrl: '/logo/Email_Sign_Logo.svg'
		})
	}
}

const handleForgotPassword = async (req, res) => {
	try {
		// get the email send by user from frontend
		const { email } = req.body;
		console.log(req.body);
		if (email === "") {
			req.flash('message', {type:'failure', value:'Email and/or password are required'});
			return res.redirect('/forgot-password');
		}
		if (!validator.validate(email)) {
			console.log('Inside Validator', email)
			req.flash('message', {type:'failure', value:'Email and/or password are required'});
                        return res.redirect('/forgot-password');
		}
		const match = await adminModel.findOne({ email: email });
		//check if the email exists in mongo
		if (match) {
			const forgot_token = jwt.sign({email: email}, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn: 300});
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
                                                         <td style="width:100%;max-width:531px;border-collapse:collapse;font-family:Roboto,arial;font-weight:500;color:rgb(255,255,255);line-height:32px;font-size:24px;padding:13px 12px 24px 40px" align="left" width="531">&nbsp; Password Update : Verification Link.</td>
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
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Warm welcome to Email Signatures. We are excited to serve you. To securely reset your account password, please open the following link on your browser. This link is valid only for five minutes. Please don't share this link with anyone.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal"><span style="color:rgb(52,152,219)"><strong>Link : <a href="${process.env.BACKEND_URL + '/change-password-render?token=' + forgot_token + '&email=' + match.email}">UPDATE PASSWORD</a>&nbsp;&nbsp;</strong></span></p>
                                                            
                                                            <p style="color:rgb(69,90,100)">After successful reset of your password, you will be redirected to the login page, we will reach out to you via email to keep you updated.&nbsp;</p>
                                                            <p style="color:rgb(69,90,100);font-weight:normal">Thank you for your patience.&nbsp;For more information regarding Email Signatures process, you may refer to the <a href="${process.env.FRONTEND_URL}" rel="noopener" target="_blank">Email Signatures FAQs</a>.</p>
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

		mailTransporter.sendMail(mailDetails, function (err, data) {
			if (err) {
				console.log('Error Occurs');
				req.flash('message', {type:'failure', value:'Failed'});
				res.redirect('/?success=false');
			} else {
				console.log('Email sent successfully');
				req.flash('message', {type:'success', value:'Verification Email Sent'});
				res.redirect('/?success=true');
			}
		});

		} else {
			req.flash('message', {type:'failure', value:'Email is invalid'});
			res.redirect('/forgot-password');
		}
	} catch (error) {
		console.log(error)
		req.flash('message', {type:'failure', value:'Some error occurred'});
		res.redirect('/forgot-password');
	}
}


const handleLogout = async (req, res) => {
	try {
		const match = await adminModel.findOne({email: req.session?.email});
		if(match){
			match.access_token = "NOT_LOGGED";
			match.is_logged_in = false;
			await match.save();
		}
		req.session.destroy();
		res.clearCookie('connect.sid');
		res.redirect('/');
	} catch (error) {
		console.log(error);
		res.redirect('/')
	}
}

const handleForgot = async (req, res) => {
	try{
	    res.render('forgot-admin', {
		logoUrl: '/logo/Email_Sign_Logo.svg',
		message:req.flash('message'),
	    });
	} catch(error){
	    console.log(error);
	    res.redirect('/')
	}
}

const handleRenderSettings = async (req, res) => {
	try{
	    // first check if the user has logged in\
	    const match = await adminModel.findOne({email: req.session.email});
	    if(!match) throw new Error('Cannot Find user.');
	    
	    res.render('settings',{
		logoUrl:'/logo/Email_Sign_Logo.svg',
                header_dashboard:false,
                header_signature_templates:false,
                header_add_templates:false,
                header_manage_users:false,
                header_manage_layout:false,
                user_type: req.session.role === 5003 ? 'admin' : req.session.role === 5002 ? 'editor' : 'creator',
                message:req.flash('message'),
		email: req.session.email,
		profileImage:match.profile_pic || '',
		username: req.session.username,
	    })
	} catch(error){
	    console.log(error);
	    req.flash('message', {type:'failure', value:'Some Error Occurred.'})
	    res.redirect('/dashboard')
	}
}

const handleProfileUpdate = async (req, res) => {
	try{
		console.log('Updaing User Profile...');
		console.log('req.file ->',req.file);
		console.log(req.body);	
		// use session info for security		
		if(!req.session.email) {
			// destroy this session anbd login again
			req.session.destroy();
                	res.clearCookie('connect.sid');
                	res.redirect('/');
		}
		const match = await adminModel.findOne({email: req.session.email})
		if(req.file.filename){
			match.profile_pic = req.file.filename || "avatar.jpg";
			await match.save();
			req.flash('message', {type:'success', value:'Profile Image Updated!'})
			return res.redirect('/settings')
		}
		else throw new Error('Error Occurred while uploading');
	} catch(error){
		console.log(error);
		req.flash('message', {type:'failure', value:error.message});
		res.redirect('/settings')
	}
}


module.exports = { handleLogin, handleLogout, handleForgotPassword, forgotPasswordRender, changePassword, handleForgot, handleRenderSettings, handleProfileUpdate }
