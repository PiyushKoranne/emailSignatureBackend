const express = require('express')
const adminAuthRouter = express.Router()
const adminAuthController = require('../controllers/adminAuthController');
const {checkLogin} = require('../middlewares/checkLogin');
const {verifyJWT} = require('../middlewares/verifyJWT');
const multer = require('multer');
const {file_upload} = require('./signatureRouter');


adminAuthRouter.post('/login', adminAuthController.handleLogin)
adminAuthRouter.get('/logout', adminAuthController.handleLogout)

adminAuthRouter.get('/forgot-password', adminAuthController.handleForgot)

adminAuthRouter.get('/settings',checkLogin, adminAuthController.handleRenderSettings)
adminAuthRouter.post('/update-admin-profile', checkLogin, file_upload.single('image') , adminAuthController.handleProfileUpdate);

adminAuthRouter.post('/send-password-link', adminAuthController.handleForgotPassword)
adminAuthRouter.get('/change-password-render', adminAuthController.forgotPasswordRender)
adminAuthRouter.post('/change-password', adminAuthController.changePassword)


// adminAuthRouter.post('/validate', verifyJWT, adminAuthController.validate)
// adminAuthRouter.post('/forgot-password', adminAuthController.handleForgotPassword)
// adminAuthRouter.get('/forgot-password-render', adminAuthController.forgotPasswordRender)
// adminAuthRouter.post('/change-password', adminAuthController.changePassword)

// adminAuthRouter.post('/get-otp', adminAuthController.sendOTPonMail)
// adminAuthRouter.post('/login-otp', adminAuthController.loginWithOTP)

// adminAuthRouter.get('/register', adminAuthController.handleRegister)
// adminAuthRouter.post('/register', adminAuthController.handleRegister)

// adminAuthRouter.get('/logout', adminAuthController.handleLogout)
// adminAuthRouter.post('/logout', verifyJWT, adminAuthController.handleLogout)



module.exports = {adminAuthRouter};
