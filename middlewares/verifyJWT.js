const {userModel} = require('../models/userModel');
const jwt = require('jsonwebtoken');

const verifyJWT = async (req, res, next) => {
    try {
        const auth = req.headers.authorization || req.headers.Authorization;
        console.log('inside verify JWT : ');
        if(!auth.startsWith('Bearer ')){
            res.status(403).json({success:false, message:'INVALID JWT TOKEN'})
        }else{
            const access_token = auth.split(" ")[1];
            console.log('Inside else block of VerifyJWT: ', auth);
            try {
                const decoded = jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET);
                req.jwt = decoded;
                next();
            } catch (error) {
                if(error.message === 'jwt expired'){
                    console.log('token expired')
                    // if token has expired, update the token as NOT LOGGED
                    const match = await userModel.findOne({email:req.body?.email});
                    if(match){
                        match.is_logged_in = false;
                        match.access_token = 'NOT_LOGGED';
                        await match.save();
                    }
                    res.status(403).json({success:false, message:'TOKEN EXPIRED'});
                } else {
                    res.status(500).json({success:false,message:'SERVER ERROR'});
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false,message:'SERVER ERROR'});
    }
}

module.exports = {verifyJWT}