const rateLimit = require('express-rate-limit');

// Rate limit :
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	message:'You can only make 100 Requests per 15mins.',
	standardHeaders: true, 
	legacyHeaders: false, 
	handler:(req, res, options) => {
		res.status(403).json({success:false, message:"Rate limit exceeded! You can only make 100 Requests per 15mins."})
	}
})

module.exports = {limiter}