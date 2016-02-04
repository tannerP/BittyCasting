/* Express Routes */
'use strict';

var User = require('../models/user');
var Role = require('../models/role');
var Project = require('../models/project');
var jwt = require('jsonwebtoken');
var config = require('../../config');

//super secret for creating token
var superSecret = config.secret;

module.exports = function(app,express){

//get an instance of the express router
var apiRouter = express.Router();

//===============================  Token Middleware  =========================
// Checks for token
apiRouter.all('*',function(req,res,next){
	//check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') ||req.headers['x-access-token'];

	//decode token
	if(token){
		//verifies secret and checks exp
		jwt.verify(token,superSecret,function(err,decoded){
			if(err){
				return res.status(403).send({
					success: false,
					message: 'Failed to authenticate token.'
				});
			}else{
				//save to request for use in other routes
				req.decoded = decoded;
				next();// this make sure we go to the next routes and dont stop here
			}
		});
	}else{
		// if there is no token
		//return an HTTP response of 403 (access forbidden) and an error message
		return res.status(403).send({
			success:false,
			message: 'No token provided.'
		});
	}
});

//===================================  /users  ================================
apiRouter.route('/admin')
	// get all the users (accessed at GET http://localhost::8080/api/users)
	.get(function(req, res) {
		console.log("received /users request")
			User.find(function(err,users){
				if(err){ 
					res.send(err);
					console.log(err); 
				}
				//res: return list of users
				else{
				console.log("Found Users" + users)
				res.json(users);
				}});
		});
apiRouter.route('/users')
	// get all the users (accessed at GET http://localhost::8080/api/users)
	.get(function(req, res) {
		console.log("received /users request")
			User.find(function(err,users){
				if(err){ 
					res.send(err);
					console.log(err); 
				}
				//res: return list of users
				else{
				console.log("Found Users" + users)
				res.json(users);
				}});
		});
//===============================  /project  ============================
apiRouter.route('/project')
	.post(function(req,res){
		console.log(JSON.stringify(req.decoded));
		var project = new Project();
		project.user = req.decoded.name;
		project.user_id = req.decoded.id;
		
		project.name = req.body.name;
		project.details = req.body./*
			Description:
			The setUTCMilliseconds() method sets the milliseconds for a specified date according to universal time.
		
			Syntax:
			dateObj.setUTCMilliseconds(millisecondsValue)
		*/
		project.role_ids = req.body.role_ids;
		project.save(function(err){
			if(err){
				return  res.json({success:false,
						error: err})
			}
			res.json({message:'Project created.'});

		})
	})
	.get(function(req, res) {
		Project.find(function(err,projects){
		if(err){ 
			res.send(err);
			console.log(err); 
		}
		//res: return list of users
		else{
		console.log("Found Users" + projects)
		res.json(projects);
	}})
	})
//===============================  /project  =========================
apiRouter.route('/project/remove/:project_id')
	.delete(function(req, res){
		//TODO need to add more security here (i.e query user, then search if user owns project_id  )
		
		Project.remove({
			_id:req.params.project_id
		}, function(err,user){
			if(err) return res.send(err);
			res.json({message: 'Successfully deleted'});
		})
	})
apiRouter.route('/project/:project_id')
	.get(function(req,res){
		Project.findById(req.params.project_id, function(err,proj){
			res.json({success:true, project:proj});
		})
	})
	.put(function(req,res){
		Project.findById(req.params.project_id, function(err,project){
			if(err) res.send(err);
			project.name = req.body.name;
			project.details = req.body.details;
			project.save(function(err){
				if (err) console.log(err);
				if (err) res.send(err);
				else{
						res.json({
						success: true,
						message:'Project updated!',
					});	
				}
			})
		})
	})

var util = require('util'); //TODO remove along with instance usages below


apiRouter.route('/createRole/:project_id')
	.post(function(req,res){
		console.log(JSON.stringify(req.body, null, 4));

		var role = new Role();
		role.user = req.decoded.name;
		  role.userID = req.decoded.id;
		role.projectID = req.params.project_id;

		role.name = req.body.name;
		role.details = req.body.details;
		role.resume = req.body.resume;
		role.HS = req.body.HS;
		role.coverletter = req.body.coverLetter;
		role.auditionvideo = req.body.auditionVideo;
		role.monologue = req.body.monologue;
		role.save(function(err){
			if(err){
				return  res.json({success:false,
						error: err})
			}
			res.json({message:'Project created.'});

		})
		console.log("monologue "+ req.body.monologue);
		console.log(role.details);
		console.log(role.coverletter);
		console.log(JSON.stringify(role, null, 4));

	})


//===============================  /users/:user_id  ============================
apiRouter.route('/users/:user_id')
	//get the user with that id
	//(accessed at GET http://localhost:8080/api/users/:user_id)
	.get(function(req,res){
		User.findById(req.params.user_id, function(err,user){
			if(err) res.send(err);
			//return that user
			res.json(user);
		});
	})
	//update the user with this id
	//(accessed at PUT http://localhost:8080/api/users/:user_id)
	.put(function(req,res){
			//use our user model to find the user we want
			User.findById(req.params.user_id,function(err,user)
			{
				if(err) res.send(err);
				//update the users info only if its new
				if(req.body.name) user.name = req.body.name;
				if(req.body.username) user.username = req.body.username;
				if(req.body.password) user.password = req.body.password;
				//save the user
				var self = this;
				user.save(function(err){
					if(err) console.log(err);
					if(err) res.send(err);
					//return a message
					else{
						var token = jwt.sign({
							name: self.name,
							username: self.username
						}, superSecret, {expiresIn: 86400}); //24 hrs
						res.json({
							name: user.name,
							success: true,
							message:'User updated!',
							token: token
						});	
					}
				});
			});
		})

	.delete(function(req, res){
		User.remove({
				_id:req.decoded.id
			}, function(err,user){
				if(err) return res.send(err);
				res.json({message: 'Successfully deleted'});
		});
	});

	return apiRouter;
};