const checkLogin = async (req, res, next) => {
	try {
		if(!req.session.logged_in){
			console.log('Inside Check LOGIN, NOT LOGGED IN')
			res.redirect('/');
		} else {
			next();
		}
	} catch (error) {
		console.log(error)
		res.redirect('/')
	}
}
const checkAdmin = async (req, res, next) => {
	try {
		if(req.session.role === 5003){
			next();
		} else {
			res.redirect('/signature-templates')
		}
	} catch (error) {
		console.log(error)
		res.redirect('/')
	}
}

module.exports = { checkLogin, checkAdmin }