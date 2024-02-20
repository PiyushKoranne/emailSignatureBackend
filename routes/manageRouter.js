const express = require('express')
const adminManageRouter = express.Router()
const adminManageController = require('../controllers/adminManageController');
const {verifyJWT} = require('../middlewares/verifyJWT');
const {file_upload} = require('./signatureRouter');
const {checkLogin, checkAdmin} = require('../middlewares/checkLogin')
// dashboard
adminManageRouter.get('/dashboard', checkLogin, adminManageController.renderDashboard);

// Signature Templates
adminManageRouter.get('/signature-templates', checkLogin,adminManageController.renderSignatureTemplates);
adminManageRouter.post('/signature-templates', checkLogin,adminManageController.getTemplatesByCategory);
adminManageRouter.post('/signature-templates-name', checkLogin,adminManageController.getTemplatesByName);
adminManageRouter.get('/signature-template-remove/:id', checkLogin, checkAdmin, adminManageController.deleteTemplate);
adminManageRouter.get('/disable-template', checkLogin,checkAdmin, adminManageController.disableTemplate)
adminManageRouter.get('/enable-template', checkLogin,checkAdmin, adminManageController.enableTemplate)

// add templates
adminManageRouter.get('/add-template', checkLogin, adminManageController.renderAddTemplate)
adminManageRouter.post('/add-template', checkLogin, file_upload.fields([{name:'template', maxCount:2}, {name:'filler_profileImage', maxCount:1}]), adminManageController.handleAddTemplate)
adminManageRouter.post('/update-template', checkLogin, file_upload.single('template'), adminManageController.updateTemplate)
// manage users
adminManageRouter.get('/manage-users', checkLogin, checkAdmin, adminManageController.renderManageUsers);
adminManageRouter.post('/create-user', checkLogin, checkAdmin, adminManageController.handleCreateUser)
adminManageRouter.get('/delete-user', checkLogin, checkAdmin, adminManageController.handleUserDelete);
adminManageRouter.get('/view-user', checkLogin, checkAdmin, adminManageController.renderViewUser)

// manage layout 
adminManageRouter.get('/manage-layout', checkLogin, checkAdmin, adminManageController.renderManageLayout)
adminManageRouter.post('/manage-layout', checkLogin, checkAdmin, file_upload.single('logo'), adminManageController.handleLayoutUpdate)
adminManageRouter.post('/manage-layout/add-testimonial', checkLogin, checkAdmin,(req, res, next)=>{ console.log(req.body); next(); }, adminManageController.handleAddTestimonial);
adminManageRouter.post('/manage-layout/add-faq', checkLogin, checkAdmin, adminManageController.handleAddFaq);
adminManageRouter.get('/manage-layout/delete-testimonial', checkLogin, checkAdmin, adminManageController.handleDeleteTestimonial);
adminManageRouter.post('/manage-layout/delete-faq', checkLogin, checkAdmin, adminManageController.handleDeleteFaq);

// for errors and maintainence
adminManageRouter.get('/err', adminManageController.renderErrorHandler);
adminManageRouter.post('/reset-password', checkLogin, adminManageController.resetPassword);

// adminManageRouter.post('/validate', verifyJWT, adminAuthController.validate)
// adminManageRouter.post('/forgot-password', adminAuthController.handleForgotPassword)
// adminManageRouter.get('/forgot-password-render', adminAuthController.forgotPasswordRender)
// adminManageRouter.post('/change-password', adminAuthController.changePassword)

// adminManageRouter.post('/get-otp', adminAuthController.sendOTPonMail)
// adminManageRouter.post('/login-otp', adminAuthController.loginWithOTP)

// adminManageRouter.get('/register', adminAuthController.handleRegister)
// adminManageRouter.post('/register', adminAuthController.handleRegister)

// adminManageRouter.get('/logout', adminAuthController.handleLogout)
// adminManageRouter.post('/logout', verifyJWT, adminAuthController.handleLogout)



module.exports = {adminManageRouter};
