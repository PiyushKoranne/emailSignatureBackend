const allowedOrigins = ['http://localhost:3000'];

const corsConfig = {
    origin:function(originUrl, cb){
        if(allowedOrigins.indexOf(originUrl) !== -1 || !originUrl){
            cb(null, true);
        }else{
            cb(new Error('BLOCKED BY CORS'), false);
        }
    }
}

module.exports = {corsConfig}