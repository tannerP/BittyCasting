/* Express Routes */
'use strict';

var User = require('../models/user');
var Role = require('../models/role');
var Project = require('../models/project');
var jwt = require('jsonwebtoken');
var config = require('../../config');

var superSecret = config.secret;

module.exports = function(app,express){

var apiRouter = express.Router();

//===============================  Token Middleware  =========================
apiRouter.all('*',function(req,res,next){
	var token = req.body.token || req.param('token') ||req.headers['x-access-token'];

	if(token){
		jwt.verify(token,superSecret,function(err,decoded){
			if(err){
				return res.status(403).send({
					success: false,
					message: 'Failed to authenticate token.'
				});
			}else{
				req.userData = User.findOne({'_id':decoded.id}, function(err, data){
					if(data){
						return data;
					}})
				/*console.log("req.userData" +req.userData);*/
				/*req.userData = user.select('_id username email');
				console.log(req.userData);*/
				req.decoded = decoded;
				next();
			}
		});
	}else{
		return res.status(403).send({
			success:false,
			message: 'No token provided.'
		});
	}
});

//===============================  Get All Roles ============================
apiRouter.route('/roles/:projectID')
	.get(function(req, res) {
		console.log('/roles/:prjID');
		console.log("Project ID 1"+ req );
		var output = '';
		for (var property in req.params) {
  	output += property + ': ' + req.params[property]+'; ';
}
	console.log(output);
	/*console.log("Found roles: " + req.params.projectID.toSource());*/
		Role.find({ 'projectID': req.params.projectID},function(err,roles){
			if(err){ 
				res.send(err);
				console.log(err); 
			}
			else{
			res.json({'success':true ,'data':roles});
		}
	})
});
//create role
apiRouter.route('/createRole/:projectID')
		.post(function(req,res){
				var role = new Role();
				role.user = req.decoded.name;
				role.userID = req.decoded.id;
				console.log(req.body);
				
				role.projectID = req.params.projectID;
				role.name = req.body.name;
				role.details = req.body.details;
				role.resume = req.body.resume;
				role.HS = req.body.HS;
				role.coverletter = req.body.coverLetter;
				role.auditionvideo = req.body.auditionVideo;
				role.monologue = req.body.monologue;
				console.log(role);
				
				role.save(function(err){
					if(err){
						return  res.json({success:false,
								error: err})	}
					res.json({message:'Role created.'});
					})
				})

//===============================  CastingBoard  ============================
apiRouter.route('/role/:role_id')
	.get(function(req,res){
		Role.findOne({_id:req.params.role_id}, function(err, data){
			if(!err){
			res.json({success:true, data:data});
		}})
	})
	.delete(function(req, res){
		Role.remove({
			_id:req.params.role_id
		}, function(err,user){
			if(err) return res.send(err);
			res.json({message: 'Successfully deleted'});
		})
	})

	.put(function(req,res){
		Role.findById(req.params.role_id, function(err,role){
			if(err) res.send(err);
				// Don't need to update
				/*role.user = req.decoded.name;
				role.userID = req.decoded.id;
				role.projectID = req.params.role_id;*/

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
								error: err})	}
					res.json({message:'Role saved.'});
				})
				/*role.save(function(err){
				if (err) console.log(err);
				if (err) res.send(err);
				else{
						res.json({
						success: true,
						message:'Project updated!',
					});	
				}*/
			})
		})


//===============================  Project  ============================
apiRouter.route('/project')
	.post(function(req,res){
		/*console.log(req.userData);*/
		var project = new Project();
		project.user = req.decoded.name;
		project.user_id = req.decoded.id;
		project.name = req.body.name;
		project.details = req.body.details
		project.save(function(err){
			if(err){
				return  res.json({success:false,
						error: err})
			}
			res.json({message:'Project created.'});

		})
	})
	//get all projects belong to user
	.get(function(req, res) {
		console.log("getting all roles belong to project.");
		console.log(req.decoded.id);
		Project.find({ user_id: req.decoded.id},function(err,projects){
		if(err){ 
			res.send(err);
			console.log(err); 
		}
		else{
		console.log("Found Projects: " + projects)
		res.json({'success':true ,'data':projects});
	}})
	})

//===============================  Project:project_id  ============================
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
	.delete(function(req, res){
		//TODO need to add more security here (i.e query user, then search if user owns project_id  )		
		Project.remove({
			_id:req.params.project_id
		}, function(err,user){
			if(err) return res.send(err);
			res.json({message: 'Successfully deleted'});
		})
	})

	apiRouter.route('/me')
	.get(function(req,res){
			User.findById(req.decoded.id, function(err,user){
			if(err) res.send(err);
			res.json(user);
		})
		});
//===============================  USERS  ============================
apiRouter.route('/users/:user_id')
	.get(function(req,res){
		User.findById(req.params.user_id, function(err,user){
			if(err) res.send(err);
			res.json(user);
		});
	})
	.put(function(req,res){
			User.findById(req.params.user_id,function(err,user)
			{
				if(err) res.send(err);
				if(req.body.name) user.name = req.body.name;
				if(req.body.username) user.username = req.body.username;
				if(req.body.password) user.password = req.body.password;
				var self = this;
				user.save(function(err){
					if(err) console.log(err);
					if(err) res.send(err);
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
		console.log(req.decoded.id);
		User.remove({
				_id:req.decoded.id
			}, function(err,user){
				if(err) return res.send(err);
				res.json({message: 'Successfully deleted'});
		});
	});

//===================================  /Admin  ================================
apiRouter.route('/admin')
	// get all the users (accessed at GET http://localhost::8080/api/users)
	.get(function(req, res) {
		console.log("received /users request")
			User.find(function(err,users){
				if(err){ 
					res.send(err);
					console.log(err); }
				//res: return list of users
				else{
				console.log("Found Users" + users)
				res.json(users); }});
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
	return apiRouter;
}