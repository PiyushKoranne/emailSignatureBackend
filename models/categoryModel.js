const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
        default:'IT'
    },
    total_templates:{
        type:Number,
    }
}, {timestamps:true});

const categoryModel = mongoose.model('Category', CategorySchema);

module.exports = { categoryModel };