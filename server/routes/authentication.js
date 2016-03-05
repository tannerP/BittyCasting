'user strick';
var User = require("../models/user");
var config = require("../../config");
var path = require('path');
var jwt = require('jsonwebtoken');
var passport = require('passport');

module.exports = function(app,express){
var app = express.Router();

app.route('/')
	.get(function(req,res){
		res.sendFile(path.join(__dirname+ '../../../public/app/views/index.html'));
	})

app.route('/login')
	.post(function(req, res){
		console.log(req.body);
		User.findOne({
			email: req.body.email
		}).select('name email password').exec(function(err,user){
			if(err) throw err;
			if(!user){
				res.json({
					success:false,
					message:'Authencation failed. User not found.'
				});
			}else if (user){
				
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.json({
						success: false,
						message: 'Authencation failed. Wrong password.'
					});
				}else{
					var token = jwt.sign({
						id:user.id,
						name:user.name,
					}, config.secret , {
						expiresIn: 86400 //  (24hrs)
						// expires in 3600 * 24 = c (24 hours)
					});
					//return the information including token as JSON
					res.json({
						success: true,
						name: user.name,
						message: 'Enjoy your token!',
						token: token
					});
				}
			}
		});
	});

app.route('/register')
	//create a user (accessed at POST http://localhost:8080/api/register)
	.post(function(req,res) {
		//create a new instance of the User model
		var user = new User();
		//set the users information (comes from the request)
		user.name.last = req.body.name.first;
		user.name.first = req.body.name.first;
		user.password = req.body.password;
		user.email = req.body.email;
		console.log(user);
		//save the user and check for errors
		user.save(function(err){
			if (err){
				console.log(err);
				//duplicate entry
				if(err.code == 11000)
					return res.json({success: false,
						message: 'A user with that username already exists.'});
				else
					return res.send(err);
			}
			res.json({ message:'User created!' });
		});
	});

	return app;
}