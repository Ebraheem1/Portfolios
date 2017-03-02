// require dependincies 
var express = require('express');
var router = express.Router();
var passport=require('passport');
var multer  = require('multer');
var fs = require("fs");
var path = require('path');
var LocalStrategy=require('passport-local').Strategy;
//var userUploadsPath = path.resolve(__dirname, "user_uploads");
var Student = require('./models/student');
var Portfolio=require('./models/portfolio');
var studentController = require('./controllers/studentController');
var portfolioController = require('./controllers/portfolioController');

var paginate = require('express-paginate');
var ppsrc='';
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/user_uploads');
  },
  filename: function (req, file, callback) {
    //predefined attribute for files
   if(file.orioriginalname != null || file.originalname != '')
   {
  	var filename = file.originalname;
  	var arr = filename.split(".");
  	var filetype = arr[arr.length-1];
  	var newfilename = req.user.username + '-' + Date.now()+'.'+filetype;
    callback(null, newfilename);
    if(storagetype=="profile")
    {
    	ppsrc=newfilename;
    	req.flash('success_msg', 'Your profile picture has been uploaded successfully');
    }
    else if(storagetype=="screenshot")
    {
    	var link = req.body.project;
    	var sc= newfilename;
    	if(link == '')
    	{

    		var newPortfolio= new Portfolio({
    		name:portname,
    		img:ppsrc,
    		screenShots:[sc],
    		username:req.user.username
    		});
    		req.user.portfolioName=portname;
    		req.user.noOfProjects +=1;
    		req.user.save();
    	}
    	else{

    		var newPortfolio= new Portfolio({
    		name:portname,
    		img:ppsrc,
    		links:[link],
    		screenShots:[sc],
    		username:req.user.username
    		});
    		req.user.portfolioName=portname;
    		req.user.noOfProjects +=2;
    		req.user.save();

    	}
    	portfolioController.createPortfolio(newPortfolio,function(err,portfolio)
    		{
    			if(err)
    			{
    				throw err;
    			}
    			
 
    		});
    }
    else if(storagetype=="addsc")
    {
    	ppsrc='done';
    	portfolioController.getPortfolioByName(req.user.username,function(err,portfolio)
		{
			if(err)
			{
				throw err;
			}
			var oldscs= portfolio.screenShots;
			oldscs.push(newfilename);
			portfolio.screenShots=oldscs;
			portfolio.save();
			req.user.noOfProjects +=1;
			req.user.save();
			
		});

    }
    
   
  }
  else{
  	
  }

}
});


var upload = multer({ storage : storage}).single('userPhoto');

// add routes
//router.get('/', projectController.getAllProjects);




router.get('/', function(req,res)
	{
		res.render('index');
	});
router.get('/login', function(req,res)
	{	
		res.render('login');
	});

router.get('/summary',function(req,res,next)
{
	res.redirect("/summary/page/0");
});
router.get('/summary/page/:page',portfolioController.getAllProtfolios);

router.get('/profile',ensureAuthenticated,function(req,res)
{
	res.render('profile',req);
});


router.get('/newproject',ensureAuthenticated,function(req,res)
{
	res.render('newproject',req);
});

router.get('/ownportfolio',ensureAuthenticated,function(req,res)
{	
	portfolioController.getPortfolioByName(req.user.username,function(err,portfolio)
	{
			if(err)
			{
				throw err;
			}
			var links = portfolio.links;
			var screenShots=portfolio.screenShots;
			var n = links.length;
			var m = screenShots.length;
			var name= portfolio.name;
			var img = portfolio.img;
			var username = req.user.username;
			if(img != '')
		{
		res.render('ownportfolio',{
		username:username,
		n:n,
		m:m,
		name:name,
		links:links,
		screenShots:screenShots,
		img:img,
		req:req

		});
		}
		else{
			res.render('ownportfolio',{
			username:username,
			n:n,
			m:m,
			name:name,
			links:links,
			screenShots:screenShots,
			img:'http://placehold.it/380x500',
			req:req
		});
		}

	});
	
	
	
});

router.get('/addfirstwork',ensureAuthenticated, function(req,res)
	{
		res.render('addfirstwork');
	});
router.get('/addlink',ensureAuthenticated, function(req,res)
	{
		res.render('addlink');
	});
router.get('/addsc',ensureAuthenticated, function(req,res)
	{
		res.render('addsc');
	});


router.get('/logout',ensureAuthenticated, function(req, res){
	
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/');
});
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}




router.post('/addprofilepicture',function(req,res) {
	
	storagetype="screenshot";
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        link = req.body.project;

        //var temp = req.body.userPhoto;
        //This if condition works if the user enters only the link
        if(req.user.noOfProjects == 0 && link != '')
        {
        	var newPortfolio= new Portfolio({
    			name:portname,
    			img:ppsrc,
    			links:[link],
    			username:req.user.username
    		});
    		req.user.portfolioName=portname;
    		req.user.noOfProjects +=1;
    		req.user.save();
    		portfolioController.createPortfolio(newPortfolio,function(err,portfolio)
    		{
    			if(err)
    			{
    				res.render('addfirstwork',{
					errors:err
				});
    			}
    			
    			
    		});
    		
    	}
    	else if(req.user.noOfProjects == 0){
    		
    		req.flash('error_msg', 'You should add at least one work to create your portfolio');
    		res.redirect('/addfirstwork');
    		return;
    	}
    	req.flash('success_msg', 'Your Portfolio has been created successfully');
    	
    	res.redirect('/profile');

    });
});





router.post('/project',function(req,res) {
	storagetype="profile";
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        //res.redirect('/users/profile/'+req.user.id);
        //console.log(req.body.name);
        var portfolioName=req.body.name;
        req.checkBody('name', 'The name is required').notEmpty();
        var errors = req.validationErrors();
        if(errors){
		res.render('newproject',{
			errors:errors
		});
		}else{
			portname=portfolioName;
			
			res.redirect('/addfirstwork');
		} 

    });
});

router.post('/addsc',function(req,res)
{
	storagetype="addsc";
	upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
		if(ppsrc != 'done')
		{
		res.render('addsc',{
			message:'You should add screenshot'
		});
		}
		else{
			req.flash('success_msg', 'Your work has been added successfully');
    		res.redirect('/profile');

		}

    });


});

router.post('/addlink',function(req,res)
{
	var link=req.body.link;
	req.checkBody('link', 'Link is required to be able to add it to your work').notEmpty();
	var errors= req.validationErrors();
	if(errors)
	{
		res.render('addlink',{
			errors:errors
		});
	}
	else{
		portfolioController.getPortfolioByName(req.user.username,function(err,portfolio)
		{
			if(err)
			{
				throw err;
			}
			var oldlinks= portfolio.links;
			oldlinks.push(link);
			portfolio.links=oldlinks;
			portfolio.save();
			req.user.noOfProjects +=1;
			req.user.save();
			

		});
		req.flash('success_msg', 'Your work has been added successfully');
		res.redirect('/profile');

	}

});


router.post('/student', function(req, res){
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var country=req.body.country;

	// Validation
	//req.checkBody('email', 'Email is required').notEmpty();
	//req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	//req.checkBody('country', 'Country is required').notEmpty();

	var errors = req.validationErrors();
	var message=null;

	if(errors){
		res.render('index',{
			errors:errors
		});
	} else {
		var newStudent = new Student({
			email:email,
			username: username,
			password: password,
			country:country
		});
		
		
		studentController.createStudent(newStudent, function(err, user){
			if(err){
				if(err.name === 'MongoError'){
					req.flash('error_msg', 'The username or the email or both already in use');
				}
				res.redirect('/');

			}

			else{
			req.flash('success_msg', 'You are registered and can now login');
			res.redirect('/login'); 
			}
			
		});
		
		
		

		
	}
});






  passport.use('login', new LocalStrategy(
  function(username, password, done) {
   studentController.getStudentByUsername(username, function(err, user){
   	if(err) {
   		throw err;
   	}
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   		//return done(null, false);
   	}

   	studentController.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			//req.flash('success_msg', 'You have successfully logged in');
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   			//return done(null, false);

   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  studentController.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('login', {failureRedirect:'/login',failureFlash: true}),
  function(req, res) {
  	req.flash('success_msg', 'You are logged in correctly :)');
    res.redirect('/profile');
  });



// export router

module.exports = router;
