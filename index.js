const express = require('express');
const server = express();
const cors  = require('cors');
// const {corsConfig} = require('./config/corsConfig');
require('dotenv').config();
const PORT = process.env.PORT || 4001;
const path = require('path');
const flash = require('connect-flash');
const {authRouter} = require('./routes/authRouter');
const {signatureRouter} = require('./routes/signatureRouter');
const {connectDB} = require('./config/dbConn');
const multer = require("multer");
const mongoose = require('mongoose');
const { limiter } = require('./middlewares/rateLimit');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts')
const ejs = require('ejs');
const { adminAuthRouter } = require('./routes/adminAuthRouter');
const { adminManageRouter } = require('./routes/manageRouter');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const {checkLogin} = require('./middlewares/checkLogin');
const cookieParser = require('cookie-parser');
const corsOptions = {
	origin: [process.env.PRODUCTION_URL,'http://192.168.16.36:3000','http://192.168.16.139:3000'],
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	allowedHeaders: 'Content-Type,Authorization',
	credentials: true, // Enable credentials (cookies, HTTP authentication)
  };

  console.log("Trying to connect to MongoDB...");
// middlewares
connectDB();

// res.header("Access-Control-Allow-Origin", "*");

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

server.use(session({
	secret:process.env.SESSION_SECRET,
	resave:false,
	saveUninitialized:false,
	store: MongoStore.create({
		mongoUrl:process.env.MONGODB_URI,
	}) 
}))

server.use(flash());
server.use(expressLayouts);
server.use(cookieParser());
server.set('view engine', 'ejs')
// server.use(morgan("combined",{stream:accessLogStream})); // will be "combined" on production
server.use(morgan("dev")); // will be "combined" on production
server.use(cors(corsOptions));
server.use(express.urlencoded({extended:true}));
server.use(express.json());
server.use(express.static(path.join(__dirname,'public')));
server.use(limiter);

//routes
server.options('*', cors(corsOptions));
server.get('/', (req, res)=>{
	if(req.session.logged_in){
		return res.redirect('/dashboard')
	}
    return res.render('welcome', {
		logoUrl:'/logo/Email_Sign_Logo.svg',
		message:req.flash('message'),
	})
})

server.use('/auth', authRouter);
server.use('/signature', signatureRouter);
server.use('/', adminAuthRouter);
server.use('/', checkLogin, adminManageRouter);

server.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
	  // MulterError indicates a Multer-specific error
	  res.status(400).json({ success:false, message: 'File upload error', error: err.message });
	} else if (err) {
	  // Other types of errors
	  res.status(500).json({ success:false, message: 'Internal server error' });
	}
  });

server.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../..', 'emailsignature.react.stagingwebsite.co.in', 'public_html', 'index.html'), function(err){
		if(err) res.status(500).send(err);
	})
});

//server listen // only listen for connections if mongodb is connected.
mongoose.connection.once('connected', ()=>{
    console.log('Connected to Mongo DB')
    server.listen(PORT, ()=>{
        console.log(`PROD: Server Listening for connections on PORT ${PORT}`);
    });
});

