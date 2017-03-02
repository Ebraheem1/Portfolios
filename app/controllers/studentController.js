let Student = require('../models/student');
var bcrypt = require('bcryptjs');

var erros= null;

let studentController = {
    createStudent:function(newStudent, callback){
        bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newStudent.password, salt, function(err, hash) {

	        newStudent.password = hash;
	        newStudent.save(callback);
	    });
	});
    },
    getStudentByUsername:function(username,callback)
    {
    	var query = {username: username};
    	Student.findOne(query, callback);
    },
    comparePassword:function(candidatePassword, hash, callback){
    	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	console.log('isMatch '+ isMatch);
    	callback(null, isMatch);
	});
    },
    getUserById:function(id,callback)
    {
    	Student.findById(id, callback);
    },
    
}
module.exports = studentController;