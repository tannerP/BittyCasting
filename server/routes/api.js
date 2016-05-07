/* Express Routes */
'use strict';

var User = require('../models/user');
var Profile = require('../models/profile');
var Applicant = require('../models/applicant');
var Role = require('../models/role');
var Project = require('../models/project');
var jwt = require('jsonwebtoken');
var config = require('../../config').dev;
var aws = require("../lib/aws.js")
var bitly = require("../lib/bitly.js")


module.exports = function(app, express) {
	var apiRouter = express.Router();

	//===============================  Token Middleware  =========================
	apiRouter.all('*', function(req, res, next) {
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];
		if (token) {
			jwt.verify(token, config.secret, function(err, decoded) {
				if (err) {
					return res.status(403).send({
						success: false,
						message: 'Failed to authenticate token.'
					});
				} else {
					req.userData = User.findOne({
							'_id': decoded.id
						}, function(err, data) {
							if (data) {
								data.last_active = new Date();
								data.save();
								return data;
							}
						})
						/*console.log("req.userData" +req.userData);*/
						/*req.userData = user.select('_id username email');
						console.log(req.userData);*/
					req.decoded = decoded;
					next();
				}
			});
		} else {
			return res.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
	});

	//==============================  Applicants =========================
	//Get all applicants
	apiRouter.route('/applicants/:roleID')
		.get(function(req, res) {
			Applicant.find({
				$or: [{
					'roleID': req.params.roleID
				}, {
					'roleIDs': {
						$in: [req.params.roleID]
					}
				}]
			}, function(err, apps) {
				console.log(apps)
				if (err) {
					res.send(err);
					console.log(err);
				} else {
					//TODO: remove when fully transfer to roleIDS					
					//interate through roles
					for (var app in apps) {
						var tempApp = apps[app];
						console.log(tempApp);
						if (tempApp.roleID) {
							/*if (tempRole.roleIDs.length < 1) {*/
							/*tempRole.roleIDs = [];*/
							//transfer roleID value to roleIDs array.
							tempApp.roleIDs.push(tempApp.roleID)
							tempApp.roleID = null;
							tempApp.save(function(err, data) {
								if (err)(console.log(err))
							});
						}
						/*}*/
					}

					var tempArr = [];
					for (var app in apps) {
						//check if user is in favs arr. 
						tempArr = apps[app].favs;
						apps[app].favs = [];
						for (var j in tempArr) {
							if (tempArr[j].userID === req.decoded.id) {
								console.log("adding to favs")
								apps[app].favs.push(tempArr[j])
							}

						}
						/*apps[app].favs = null;*/
					}
					res.json({
						'success': true,
						'data': apps
					});
				}
			})
		})
		//delete method
	apiRouter.route('/applicant/:appID')
		.put(function(req, res) {
			/*console.log(req.params.appID);*/
			var roleID = req.body.roleID;
			switch (req.body.status) {
				case "delete":
					{
						Applicant.findOne({
							_id: req.params.appID,
						}, function(err, app) {
							if (err) return res.send(err);
							if (app) {

								if (app.roleIDs.length > 1) {
									var index = app.roleIDs.indexOf(roleID);
									/*console.log(index);*/
									app.roleIDs.splice(index, ++index);
									app.save();
								} else {
									/*console.log("before removing supps")*/
									aws.removeSup(app.suppliments);
									/*console.log("after removing supps")*/
									Applicant.remove({
										_id: req.params.appID,
									}, function() {})
								}
								Role.findById(roleID, function(err, data) {
									if (err) return res.json({
										'error': err
									});
									if (data) {
										/*console.log("decremented totalapps")*/
										--data.total_apps;
										data.save(function() {
											return res.json({
												'success': true,
											});
										})
									}
								})
							}
						})
					}
			}


		})
	apiRouter.route('/AppCount/:ID')
		.get(function(req, res) {
			Applicant.count({
				'roleID': req.params.ID
			}, function(err, count) {
				if (err) {
					res.send(err);
					console.log(err);
				} else {
					res.json({
						'success': true,
						'data': count
					});
				}
			})
		})
		//==============================  Commenting =========================		
	apiRouter.route('/comments/:appID')
		.put(function(req, res) {
			Applicant.findById(req.params.appID, function(err, app) {
				if (err) res.json({
					successful: false,
					error: err
				});
				if (req.body.state == 'PUT') {
					app.comments.push({
						owner: req.body.owner,
						comment: req.body.comment
					});
					app.save(function(err) {
						1
						if (err) {
							return res.json({
								success: false,
								error: err
							})
						}
						res.json({
							successful: true,
							message: "Added comment"
						});
					})
				} else if (req.body.state == 'DELETE') {
					app.comments.pull({
						_id: req.body._id
					})
					app.save(function(err) {
						if (err) {
							return res.json({
								success: false,
								error: err
							})
						}
						res.json({
							successful: true,
							message: "Removed comment"
						});
					})
				} else {
					console.log("State Error: not delete nor put")
				}
			})
		})



	//===============================  Roles ============================
	apiRouter.route('/roles/:projectID')
		.get(function(req, res) {
			var output = '';
			//TODO:remove the for-loop 
			/*for (var property in req.params) {
				output += property + ': ' + req.params[property] + '; ';*/
			Role.find({
					'projectID': req.params.projectID
				}, function(err, roles) {
					console.log(roles)
					if (err) {
						res.send(err);
						console.log(err);
					} else res.json({
						'success': true,
						'data': roles
					});
				})
				/*}*/
		})
		//create role
	apiRouter.route('/createRole/:projectID')
		.post(function(req, res) {
			var role = new Role();
			role.userID = req.decoded.id;
			/*console.log(req.body);*/
			var URL = config.baseURL + "/Apply/";

			role.projectID = req.params.projectID;
			role.name = req.body.name;
			role.description = req.body.description;
			role.end_date = req.body.end_date;
			role.end_time = req.body.end_time;

			role.location = req.body.location;
			role.payterms = req.body.payterms;
			/*role.age = req.body.age;*/
			role.sex = req.body.sex;
			role.requirements = req.body.requirements;

			role.save(function(err, role) {
				if (err) {
					return res.json({
						success: false,
						error: err
					})
				} else {

					Project.findById(req.params.projectID, function(err, project) {
						if (!err) {
							++project.num_roles;
							project.save(function(err) {
								if (err) {
									return res.json({
										success: false,
										error: err
									})
								}
							})
						}
					})
					return bitly.shortenURL(URL + role._id, role._id, function(data) {
						return res.json({
							success: true,
							role: data
						});
					});
				}
			})
		})

	//===============================  Role  ============================
	apiRouter.route('/role/:role_id')
		.get(function(req, res) {
			Role.findOne({
				_id: req.params.role_id,
			}, function(err, role) {
				if (!err) {
					if (role && role.userID) {
						if (role.userID != req.decoded.id) {
							res.status("403").send({
								success: false,
								message: 'No token provided.'
							})
						} else {
							res.json({
								success: true,
								data: role
							});
						}
					}
				}
			})
		})
		.delete(function(req, res) {
			//delete all applications with this roleID
			Applicant.find({
					roleIDs: {
						$in: [req.params.role_id]
					}
				},
				function(err, apps) {
					if (err) console.log(err);
					else {
						for (var a in apps) {
							console.log(apps[a].roleIDs.length);
							if (apps[a].roleIDs.length <= 1) {
								aws.removeSup(apps[a].suppliments);
								apps[a].remove();
							} else {
								/*console.log(apps[a].roleIDs)*/
								var index = apps[a].roleIDs.indexOf(req.params.role_id);
								console.log(index);
								apps[a].roleIDs.splice(index, ++index);
								console.log(apps[a].roleIDs)
								apps[a].save();
							}
						}
					}

					Role.findById(req.params.role_id, function(err, role) {
						if (err) console.log(err);
						if (role) {
							Project.findById(role.projectID,
								function(err, project) {
									if (!err) {
										--project.num_roles;
										console.log(project.num_roles);
										project.save(function() {})
									}
								})
							Role.remove({
								_id: req.params.role_id
							}, function(err, role) {
								if (err) console.log(err)
									// --project.num_roles			
								res.json({
									message: 'Successfully deleted'
								});
							})
						}
					})
				})
		})
		.put(function(req, res) {
			Role.findById(req.params.role_id, function(err, role) {
				if (err) res.send(err);

				role.name = req.body.name;
				role.description = req.body.description;
				role.end_date = req.body.end_date;
				role.end_time = req.body.end_time;
				role.requirements = req.body.requirements;
				role.location = req.body.location;
				role.payterms = req.body.payterms;
				role.age = req.body.age;
				role.sex = req.body.sex;
				role.save(function(err) {
					if (err) {
						return res.json({
							success: false,
							error: err
						})
					}
					res.json({
						message: 'Role saved.'
					});
				})
			})
		})


	//===============================  Project  ============================
	apiRouter.route('/project')
		.post(function(req, res) {

			var project = new Project();
			project.user_id = req.decoded.id;
			project.name = req.body.name;
			project.description = req.body.description
			project.coverphoto = req.body.coverphoto

			project.save(function(err) {
				if (err) {
					return res.json({
						success: false,
						error: err
					})
				}
				res.json({
					message: 'Project created.'
				});
			})
		})
		//get all projects belong to user
		.get(function(req, res) {
			Project.find({
				user_id: req.decoded.id
			}, function(err, projects) {
				if (err) {
					res.send(err);
				} else {
					res.json({
						'success': true,
						'data': projects
					});
				}
			});
		})

	//===============================  Project:project_id  ============================
	apiRouter.route('/project/:project_id')
		/*.get(function(req,res){
			Project.findById(req.params.project_id, function(err,proj){
				//ACL
				res.json({success:true, project:proj});
			})
		})*/
		.put(function(req, res) {
			Project.findById(req.params.project_id, function(err, project) {
				if (err) res.send(err);
				if (req.body.name) project.name = req.body.name;
				if (req.body.description) project.description = req.body.description;
				if (req.body.updated_date) project.updated_date = req.body.updated_date;
				if (req.body.coverphoto) project.coverphoto = req.body.coverphoto;
				project.save(function(err) {
					if (err) console.log(err);
					if (err) res.send(err);
					else {
						res.json({
							success: true,
							message: 'Project updated!',
						});
					}
				})
			})
		})

	.delete(function(req, res) {
		Role.find({
			projectID: req.params.project_id
		}, function(err, roles) {
			for (var i in roles) {
				Applicant.find({
					roleIDs: {
						$in: [roles[i]._id]
					}
				}, function(err, apps) {
					if (err) console.log(err);
					else {
						for (var a in apps) {
							console.log(apps[a].roleIDs.length);
							if (apps[a].roleIDs.length <= 1) {
								aws.removeSup(apps[a].suppliments);
								apps[a].remove();
							} else {
								/*console.log(apps[a].roleIDs)*/
								var index = apps[a].roleIDs.indexOf(roles[i]._id);
								apps[a].roleIDs.splice(index, ++index);
								apps[a].save();
							}
						}
					}
				})
				roles[i].remove();
			}
		})
		Project.remove({
			_id: req.params.project_id
		}, function(err, project) {
			if (err) return res.send(err);
			res.json({
				message: 'Successfully deleted'
			});
		})
	})

	apiRouter.route('/me')
		.get(function(req, res) {
			User.findById(req.decoded.id, function(err, user) {
				if (err) res.send(err);
				res.json(user);
			})
		});
	//===============================  USERS  ============================
	apiRouter.route('/users/:user_id')
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);
				res.json(user);
			});
		})
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;
				var self = this;
				user.save(function(err) {
					if (err) console.log(err);
					if (err) res.send(err);
					else {
						var token = jwt.sign({
							name: self.name,
							username: self.username
						}, config.secret, {
							expiresIn: 86400
						}); //24 hrs
						res.json({
							name: user.name,
							success: true,
							message: 'User updated!',
							token: token
						});

					}
				});
			});
		})
		.delete(function(req, res) {
			User.remove({
				_id: req.decoded.id
			}, function(err, user) {
				if (err) return res.send(err);
				res.json({
					message: 'Successfully deleted'
				});
			});
		});
	//===================================  /Admin  ================================
	apiRouter.route('/admin')
		// get all the users (accessed at GET http://localhost::8080/api/users)
		.get(function(req, res) {
			User.find(function(err, users) {
				if (err) {
					res.send(err);
					console.log(err);
				}
				//res: return list of users
				else {
					res.json(users);
				}
			});
		});
	apiRouter.route('/users')
		// get all the users (accessed at GET http://localhost::8080/api/users)
		.get(function(req, res) {
			User.find(function(err, users) {
				if (err) {
					res.send(err);
					console.log(err);
				}
				//res: return list of users
				else {
					/*console.log("Found Users" + users)*/
					res.json(users);
				}
			});
		});
	return apiRouter;
}