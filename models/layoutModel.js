const mongoose = require('mongoose');
const LayoutSchema = new mongoose.Schema({
    
    logo:{
        type:String,
    },
    email:{
        type:String,
    },
    copyright:String,
    social_links:{
        facebook:{
            type:String
        },
        instagram:{
            type:String
        },
        linkedIn:{
            type:String
        },
        youtube:{
            type:String
        }
    },
    faqs:{
        Q1:{
            question:{
                type:String
            },
            answer:{
                type:String
            }
        },
        Q2:{
            question:{
                type:String
            },
            answer:{
                type:String
            }
        },
        Q3:{
            question:{
                type:String
            },
            answer:{
                type:String
            }
        },
        Q4:{
            question:{
                type:String
            },
            answer:{
                type:String
            }
        },
        Q5:{
            question:{
                type:String
            },
            answer:{
                type:String
            }
        },
        Q6:{
            question:{
                type:String
            },
            answer:{
                type:String
            }
        },
    },
    testimonials:[
        {
            type:String
        }
    ]
});

const layoutModel = mongoose.model('Filler', LayoutSchema);

module.exports = { layoutModel }