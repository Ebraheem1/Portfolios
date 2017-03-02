var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
//mongoose.Promise=global.Promise;
//var uniqueValidator= require('mongoose-unique-validator');

var studentSchema = mongoose.Schema({
    username:{
        type:String,
        required:true, 
        unique:true
    },
    password:String,
    email:{
    	type:String,
    	unique:true
    },
    country:{
        type: String,
    },
    noOfProjects:{
        type:Number,
        default: 0
    },
    portfolioName:{
        type:String,
    }
});
//studentSchema.plugin(uniqueValidator);

var Student = mongoose.model("student", studentSchema);

module.exports = Student;