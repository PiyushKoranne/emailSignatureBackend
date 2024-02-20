const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
    price_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Template',
        required:true
    },
    price:{
        type:Number,
        required:true,
        default:100
    }
});

const priceModel = mongoose.model('Price', PriceSchema);

module.exports = {priceModel}