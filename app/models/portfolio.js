var mongoose = require('mongoose');
//mongoose.Promise=global.Promise;
//var uniqueValidator= require('mongoose-unique-validator');

var portfolioSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        
    },
    img:String,
    links:[String],
    screenShots:[String],
    username:String,
    
});

//portfolioSchema.plugin(uniqueValidator);

var Portfolio = mongoose.model("portfolio", portfolioSchema);

module.exports = Portfolio;
