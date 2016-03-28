/* Express Routes */
'use strict';

var User = require('../models/user');
var Applicant = require('../models/applicant');
var Role = require('../models/role');
var Project = require('../models/project');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var aws = require("../lib/aws.js")
var bitly = require("../lib/bitly.js")


module.exports = function(app,express){
var apiRouter = express.Router();

//===============================  Token Middleware  =========================
apiRouter.all('*',function(req,res,next){
	var token = req.body.token || req.param('token') ||req.headers['x-access-token'];

	if(token){
		jwt.verify(token,config.secret,function(err,decoded){
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

//==============================  Applicants =========================
	//Get all applicants
	apiRouter.route('/applicants/:roleID')
		.get(function(req, res){
			Applicant.find({ 'roleID': req.params.roleID},function(err,roles){
			if(err){ 
				res.send(err);
				console.log(err); }
			else{
			res.json({'success':true ,'data':roles});	}
			})
		})
		apiRouter.route('/AppCount/:roleID')
		.get(function(req, res){
			Applicant.count({ 'roleID': req.params.roleID},function(err,count){
			if(err){ 
				res.send(err);
				console.log(err); }
			else{
			res.json({'success':true ,'data':count});	}
			})
		})
//==============================  Commenting =========================		
apiRouter.route('/applicant/comments/:appID')
	.put(function(req, res){
		Applicant.findById(req.params.appID,function(err,app){
				if(err) res.json({successful:false,error:err});
					if(req.body.state == 'PUT'){
						app.comments.push({owner:req.body.owner,
													comment:req.body.comment});
						app.save(function(err){
							if(err){
								return  res.json({success:false,
								error:err })	}
							res.json({successful:true,message:"Added comment"});
						})
					}								 
					else if(req.body.state =='DELETE'){
						app.comments.pull({_id:req.body._id})
						app.save(function(err){
							if(err){
								return  res.json({success:false,
								error:err })	}
							res.json({successful:true,message:"Removed comment"});
						})
					}								 
					else{
							console.log("State Error: not delete nor put")
					}
		})
	})
//==============================  Applicant =========================
	apiRouter.route('/applicant/:appID')
		.delete(function(req, res){
			Applicant.findOne({
			_id:req.params.appID,
				}, function(err,app){
					if(err) {return res.send(err);}
					if(app){
						aws.removeSup(app.suppliments);
						Role.findByIdAndUpdate(app.roleID,{$inc:{total_apps:-1}})
							Applicant.remove({
								_id:req.params.appID,
									}, function(err,app){
										if(err) {return res.send(err);}
										console.log(app)
										res.json({success:true,
											 message: 'Successfully deleted applicant'});
									})
								}
					})
				})
//===============================  Roles ============================
apiRouter.route('/roles/:projectID')
	.get(function(req, res) {
		var output = '';
				
		for (var property in req.params) {
  	output += property + ': ' + req.params[property]+'; ';

	/*console.log("Found roles: " + req.params.projectID.toSource());*/
		Role.find({ 'projectID': req.params.projectID},function(err,roles){
			if(err){ 
				res.send(err);
				console.log(err); 
			}
			else{
				/*for(var i in roles){
					Applicant.count({roleID:roles[i]._id}, function(err,count){
						roles[i].num_applicants = count;
						return;
					})
					console.log(i);
					console.log(roles.length);
					if(++i == roles.length)*/ res.json({'success':true ,'data':roles});
				}	
		
	})
}})
//create role
apiRouter.route('/createRole/:projectID')
		.post(function(req,res){
				var role = new Role();
				role.userID = req.decoded.id;
				console.log(req.body);
				var URL = "http://bittycasting.com/";
				
				role.projectID = req.params.projectID;
				role.name = req.body.name;
				role.description = req.body.description;
				role.end_date = req.body.end_date;
				role.end_time = req.body.end_time;
				
				role.location = req.body.location;
				role.payterms = req.body.payterms;
				role.age = req.body.age;
				role.sex = req.body.sex;
				role.requirements = req.body.requirements;
				
				role.save(function(err,role){
					if(err){
						return  res.json({success:false,
								error:err })	}
						else{
							
						bitly.shortenURL(URL,role._id)
						Project.findById(req.params.projectID, function(err, project){
              if(!err){
                ++project.num_roles;
                project.save(function(err){
                  if(err){
                    return  res.json({success:false,
                        error: err
                      })  
                  }
                  else{
                    return  res.json({success:true,
                        message: "Success"
                    });
                  }
						})
						}
					})
				}
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
		//delete all applications with this roleID
		Applicant.find({roleID:req.params.role_id}, 
			function(err, roles){
				if(err) return;	
					var projectID = function(){
						for(var i in roles) {
							return roles[i].projectID
						};
				Project.findById(projectID,
					function(err, project){
          if(!err){
            --project.num_roles;
            project.save(function(){})
					}
				})	
				
				for(var i in roles){
				 		aws.removeSup(roles[i].suppliments);
					}

			Role.remove({
				_id:req.params.role_id}, function(err,role){
			if(err) console.log(err)
					// --project.num_roles
				res.json({message: 'Successfully deleted'});
			})
	}})
})
		
	.put(function(req,res){
		Role.findById(req.params.role_id, function(err,role){
			if(err) res.send(err);

				role.name = req.body.name;
				role.description = req.body.description;
				role.end_date = req.body.end_date;
				role.end_time = req.body.end_time;
				role.requirements = req.body.requirements;
				role.location = req.body.location;
				role.payterms =  req.body.payterms;
				role.age =  req.body.age;
				role.sex =  req.body.sex;
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
		project.user_id = req.decoded.id;
		project.name = req.body.name;
		project.description = req.body.description
		
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
		Project.find({ user_id: req.decoded.id},function(err,projects){
		if(err){ 
			res.send(err);
			console.log(err); 
		}
		else{
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
			project.description = req.body.description;
			project.updated_date = req.body.updated_date;
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
		//Remove 
		Role.find({projectID:req.params.project_id}, function(err, roles){
			for(var i in roles){
				Applicant.find({roleID:roles[i]._id}, 
					function(err, apps){
						if(err) res.json({success:false, error: err})	
						for(var i in apps){
					 		aws.removeSup(apps[i].suppliments);
						}
				})
			console.log("removing this role");
			roles[i].remove();
		}
	})

	Project.remove({
			_id:req.params.project_id
		}, function(err,project){
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
						}, config.secret, {expiresIn: 86400}); //24 hrs
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

//===================================  /Admin  ================================
apiRouter.route('/admin')
	// get all the users (accessed at GET http://localhost::8080/api/users)
	.get(function(req, res) {
			User.find(function(err,users){
				if(err){ 
					res.send(err);
					console.log(err); }
				//res: return list of users
				else{
				res.json(users); }});
		});
apiRouter.route('/users')
	// get all the users (accessed at GET http://localhost::8080/api/users)
	.get(function(req, res) {
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