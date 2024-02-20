const express = require('express')
const authRouter = express.Router()
const authController = require('../controllers/authController');
const {verifyJWT} = require('../middlewares/verifyJWT');

authRouter.get('/login', authController.handleLogin)
authRouter.post('/login', authController.handleLogin)

// refresh token 
authRouter.post('/refresh', authController.refreshToken)
authRouter.get('/refresh-user', authController.refreshUser)
authRouter.post('/add-user-data', verifyJWT, authController.addUserData)
authRouter.post('/validate', verifyJWT, authController.validate)
authRouter.post('/forgot-password', authController.handleForgotPassword);
authRouter.get('/forgot-password-render', authController.forgotPasswordRender)
authRouter.post('/change-password', authController.changePassword)

authRouter.post('/get-otp', authController.sendOTPonMail)
authRouter.post('/login-otp', authController.loginWithOTP)

authRouter.get('/register', authController.handleRegister)
authRouter.post('/register', authController.handleRegister)
authRouter.post('/verify-email', authController.verifyEmail)
authRouter.post('/verify-otp', authController.verifyOTP)

authRouter.get('/logout', authController.handleLogout)
authRouter.post('/logout', verifyJWT, authController.handleLogout)



module.exports = {authRouter};
