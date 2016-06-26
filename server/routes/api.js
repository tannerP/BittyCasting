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
var http = require('http');
var Mailgun = require("mailgun-js");
var Invite = require('../models/invite');
var async = require('async');



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
								decoded.name = data.name;
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
	apiRouter.route('/collab/remove/')
		.put(function(req, res) {
			/*console.log(req.body)*/
			if (req.body.projectID && req.body.userID) {
				Project.findById(req.body.projectID, function(err, project) {

					if (!project) return res.json({
							success: false,
							message: 'Project not found.'
						})
						//search, then remove collab
					for (var i in project.collabs_id) {
						var collab = project.collabs_id[i];
						if (collab.userID.indexOf(req.body.userID) > -1) {
							/*console.log("found collab")*/
							project.collabs_id.splice(i, 1);

							
							Applicant.find({
								roleID: project.roleID
							}, function(err, app) {
								/*console.log(app)
								console.log(err)*/
								if (!app) return;

								var usrInx = -1;

								for (var i in app.favs) {
									var curr = {};
									curr.roleID = app.favs[i].roleID,
										curr.userID = app.favs[i].userID;
									if (curr.userID === req.decoded.id && curr.roleID === req.body.roleID) {

										usrInx = i;

										if (usrInx > -1) {
											//remove collab favoriting data
											app.favs.splice(usrInx, 1);
											//remove viewed
											for (var i in app.userViewed_IDs) {
												var curr = {};
												curr.roleID = app.userViewed_IDs[i].roleID,
													curr.userID = app.userViewed_IDs[i].userID;

												if (curr.userID === req.decoded.id && curr.roleID === req.body.roleID) {

													usrInx = i;
													if (usrInx > -1) {
														//remove reviewed data
														app.userViewed_IDs.splice(usrInx, 1);
														console.log("Saving app")
														app.save()
													}
												}
											}
										}
									}
								}



							});

							project.save(function(err, data) {
								User.findById(req.body.userID, function(error, user) {
									if (!user) return res.json({
											success: false,
											message: "Unable to update request."
										})
										/*console.log(user)*/
									var ind = user.invites.indexOf(req.body.projectID);
									if (ind > -1) {
										/*if(user.invites.length ===1) user.invites =[];*/
										user.invites.splice(ind, 1);
										user.save(function(err, user) {
											if (!err) return res.json({
												success: true
											})
										})
									}
								})

							});
							break;
						}
					}
				})
			} else return res.json({
				success: false,
				message: "Invalid request"
			})
		})
	apiRouter.route('/collab/response/')
		.put(function(req, res) {
			var response = req.body.response,
				projectID = req.body.projectID;

			/*			console.log(req.body.response)
						console.log(req.body.projectID)*/
			//accept invitation
			//mark project.collabs_id.accepted = true;
			User.findById(req.decoded.id, function(error, user) {
				var ind = user.invites.indexOf(projectID);

				if (ind > -1) {
					/*if(user.invites.length ===1) user.invites =[];*/
					user.invites.splice(ind, 1);
					/*console.log(user.invites)*/
					user.save(function(err, data) {
						Project.findById(projectID, function(err, project) {
							/*console.log(collabs)*/
							if (err) return res.json({
								success: false,
								message: "No project"
							});
							//search for user
							/*console.log(project)*/
							for (var i in project.collabs_id) {
								var collab = project.collabs_id[i];
								collab.responded = true;
								if (collab.userID.indexOf(req.decoded.id) > -1) {
									//accept invite
									if (response === true) {
										collab.accepted = true;
										break;
									}
									//reject invite
									else {
										project.collabs_id.splice(i, 1);
									}
								}
							}
							project.save(function(error, data) {
								if (data) return res.json({
									success: true,
									project: data
								})
								else return res.json({
									success: false,
									error: error
								})
							})
						})

					})
				}
			})
		})
	apiRouter.route('/collab/invite/:projectID')
		.put(function(req, res) {
			var tStamp = req.body.timestamp;
			var mailgun = new Mailgun({
				apiKey: config.api_key,
				domain: config.domain
			});
			var guestEmail = req.body.email,
				usrID = req.decoded.id,
				projectID = req.body.projectID,
				projectName = req.body.projectName;

			User.findOne({
				email: guestEmail
			}, function(err, user) {
				var invite = new Invite();
				var emailData = {}
				if (!user) invite.member = false;
				else {
					invite.member = true;
					invite.guestID = null;
				}

				invite.userID = req.decoded.id;
				invite.guestEmail = guestEmail;
				invite.projectID = projectID;
				invite.projectName = projectName;
				invite.notify = true;
				invite.notify_type = "invite";


				invite.save(function(err, data) {
					if (err) return res.json({
						sucess: false
					});
					//if invitee is not a member
					if (data.member) {
						/*var notification = {};
						notification.notification_type = "invite"
						notification.data = invite;
						user.notifications.unshift(notification);*/


						var URL = "bittycasting.com/login";
						emailData = {
							from: "friends@bittycasting.com",
							to: guestEmail,
							subject: "BittyCasting invitation to collaborate on " + req.body.projectName,
							html: "A user on BittyCasting has invited you to collaborate on a project. To register and accept, go to " + URL,
						}
						Project.findById(projectID, function(error, project) {
							var data = {};
							var exist = false;
							if (user.invites.indexOf(projectID) === -1) {
								//this ensure no duplication
								user.invites.push(projectID)
							}

							data.accepted = false;
							data.responded = false;
							data.userID = user._id;
							//BUG
							for (var i in project.collabs_id) {
								var collab = project.collabs_id[i];
								if (collab.userID === user._id) {
									exist = true;
									break;
								}
							}
							if (project.collabs_id.length < 1 || !exist) {
								project.collabs_id.push({
										userID: user._id,
										userName: user.name,
										userProfilePhoto: user.profile,
									})
									/*console.log(project.collabs_id)*/
								project.save(function(error, project) {
									if (!error) {
										user.save(function(error, user) {
											if (user) {
												return res.json({
													success: true,
													user_name: user.name,
													userID: user._id
												});
											}
											if (!error) {
												mailgun.messages()
													.send(emailData, function(err, data) {
														/*console.log(err)
														console.log(data)*/
													});
											}
										})
									}
								})
							}
						})

					} else { //Invitee is not a member
						var URL = "https://bittycasting.com/register/invite/" + data._id;
						/*console.log(URL)*/
						/*bitly.shorten(URL, function(newURL) {*/

						emailData = {
							from: "friends@bittycasting.com",
							to: guestEmail,
							subject: "BittyCasting invitation to collaborate on " + req.body.projectName,
							html: "A user on BittyCasting has invited you to collaborate on a project. To register and accept, go to " + URL /*+*/
								/*"invite ID " + data._id,*/
						}
						mailgun.messages()
							.send(emailData, function(err, data) {
								/*console.log(data)*/
								return res.json({
									success: true,
									message: data
								});
							});
						/*})*/
					}

				})
			})
		})

	//==============================  Applicants =========================
	//route for adding new requirement. 
	apiRouter.route('/app/:app_id')
		.put(function(req, res) {
			if (req.body.status === "new") {
				/*console.log(req.body);*/
				Applicant.findById(req.params.app_id, function(err, app) {
					if (err) {
						return res.json({
							success: false,
							error: err,
							message: "App doesn't exist"
						});
					}
					var money = {}
					money.roleID = req.body.roleID;
					money.userID = req.decoded.id;
					var viewed = app.userViewed_IDs;
					//return if user has already viewed
					for (var i in viewed) {
						if (viewed[i].userID === money.userID && viewed[i].roleID === money.roleID) {
							return res.json({
								success: false,
								message: "Already exist",
								viewed: true
							});
						}
					}
					app.userViewed_IDs.push(money);
					/*console.log(app.userViewed_IDs)*/
					app.save(function(err, data) {
						if (err) {
							return res.json({
								success: false,
								error: err
							});
						} else {
							return res.json({
								success: true,
								message: "Updated",
								viewed: true
							});
						}
					})
				});
				//TODO: move to /api
			} else if (req.body.status === "fav") {
				//role favoriting for. 
				Applicant.findById(req.params.app_id, function(err, app) {
					/*= req.body.favorited;*/

					/*console.log(tempFav);*/
					var usrInx = -1;
					//check if user ever favorited applicant for this role

					for (var i in app.favs) {
						var curr = {};
						curr.roleID = app.favs[i].roleID,
							curr.userID = app.favs[i].userID;

						// if applicant has been favorited for spec. role. 
						if (curr.userID === req.decoded.id && curr.roleID === req.body.roleID) {
							usrInx = i;
						}
					}
					if (usrInx === -1) {
						/*          console.log("adding for the first time");*/
						var reqData = {
							roleID: req.body.roleID,
							userID: req.decoded.id,
							favorited: true
						};
						app.favs.push(reqData);
						/*console.log(app.favs)*/
					} else {
						/*console.log("toggle favorite")*/
						app.favs[usrInx].favorited = !app.favs[usrInx].favorited;
						/*console.log(app.favs[usrInx].favorited);*/
					}
					/*app.favorited = req.body.favorited;*/
					/*console.log()*/
					/*app.favs=[];*/
					app.save(function(err, data) {
						/*console.log(data.favs);*/
						if (err) {
							return res.json({
								success: false,
								error: err
							})
						} else {
							/*console.log("Success updating favorited");
							console.log(data);*/
							return res.json({
								success: true,
							});
						}
						/*return res.json({
						  success: true,
						  message: 'updated'
						});*/
					})
				});
			}
		})
		//Get all applicants
	apiRouter.route('/applicant/sample/')
		.put(function(req, res) {
			/*console.log("/applicant/sampleApplicant");
			console.log(req.body)*/
			/*['ryan', "kaiting"]*/
			var sampleApplicantIDs = ["574a1684d302426a449836f8",
				"574a163bd302426a449836f5",
			]

			Applicant.find({
					'_id': {
						$in: sampleApplicantIDs
					}
				}, function(err, applicants) {
					/*console.log(applicants)*/

					for (var i in applicants) {
						applicants[i].roleIDs.push(req.body[i])
						applicants[i].save(function(err, data) {
							async.map(req.body, updateCount, function(e, r) {
								return;
							});

							function updateCount(id, callback) {
								Role.findById(id, function(err, role) {
									/*console.log("line 197:found role")*/
									if (!err) {
										Applicant.count({
											$or: [{
												'roleID': id
											}, {
												'roleIDs': {
													$in: [id]
												}
											}]
										}, function(err, count) {
											/*console.log("updated count "+count )*/
											/*console.log(count);*/
											if (err) return callback(err, null);
											else {
												role.total_apps = count;
												/*console.log(role.total_apps);*/
												role.save(function(err, data) {
													/*console.log(data.name)
													console.log(data.total_apps)*/
												});
												return callback();
											}
										})
									}
								})
							}
						})
					}
					return res.json({
						success: true
					})
				})
				/*Applicant.findOne({_id:req.body.})*/
		})

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
				/*console.log(apps)*/
				if (err) {
					res.send(err);
					console.log(err);
				} else {
					//TODO: remove when fully transfer to roleIDS					
					//interate through roles
					for (var app in apps) {
						var tempApp = apps[app];
						if (tempApp.roleID) {
							tempApp.roleIDs.push(tempApp.roleID)
							tempApp.roleID = null;
							tempApp.save(function(err, data) {
								if (err)(console.log(err))
							});
						}
					}

					var tempArr = [];
					for (var app in apps) {
						//check if user is in favs arr. 
						tempArr = apps[app].favs;
						apps[app].favs = [];
						for (var j in tempArr) {
							if (tempArr[j].roleID === req.params.roleID) {
								apps[app].favs.push(tempArr[j])
							}

						}
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
									if (app.suppliments.length > 0) {
										aws.removeSup(app.suppliments);
									}
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
				$or: [{
					'roleID': roleID
				}, {
					'roleIDs': {
						$in: [roleID]
					}
				}]
			}, function(err, count) {
				/*console.log(count);*/
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
				/*console.log(req.body);*/
				app.comments.push({
					timestamp: new Date(),
					ownerID: req.body.ownerID,
					owner: req.body.owner,
					comment: req.body.comment
				});
				app.save(function(err, app) {
					if (err) {
						return res.json({
							success: false,
							error: err
						})
					}
					res.json({
						successful: true,
						message: "Added comment",
						comments: app.comments
					});
				})
			})
		})
	apiRouter.route('/comments/delete/:appID')
		.put(function(req, res) {
			/*console.log(req.body)*/
			Applicant.findOne({
					_id: req.params.appID
				},
				function(err, app) {
					for (var i in app.comments) {
						var comment = app.comments[i];
						/*console.log(comment._id)
						console.log(req.body._id)*/
						if (comment._id.toString() === req.body._id) {
							app.comments.pull(app.comments[i])
							app.save(function(err, data) {
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
							break;
						} else {
							return res.json({
								success: false,
								message: "Can't seem to find comment"
							})
						}
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
					/*console.log(roles)*/
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

			role.age = req.body.age;
			role.compensation = req.body.compensation;
			role.description = req.body.description;
			role.ethnicity = req.body.ethnicity;
			role.union = req.body.union;
			role.end_date = req.body.end_date;
			role.end_time = req.body.end_time;
			role.location = req.body.location;
			role.name = req.body.name;
			role.payterms = req.body.payterms;
			role.projectID = req.params.projectID;
			role.usage = req.body.usage;
			role.sex = req.body.sex;
			role.requirements = req.body.requirements;

			role.save(function(err, role) {
				/*console.log(role)*/
				if (err) {
					return res.json({
						success: false,
						error: err
					})
				} else {
					Project.findById(req.params.projectID, function(err, project) {
						if (!err) {
							Role.count({
								projectID: project._id
							}, function(err, count) {
								project.num_roles = count;
								project.save(function(err) {
									if (err) {
										return res.json({
											success: false,
											error: err
										})
									} else return;
								})
							})
						}
					})
					bitly.shortenURL(URL + role._id, role._id, function(data) {
						return res.json({
							success: true,
							roleID: role._id
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
							if (apps[a].suppliments.length > 0) {
								aws.removeSup(apps[a].suppliments);
								apps[a].remove();
							} else {
								/*console.log(apps[a].roleIDs)*/
								var index = apps[a].roleIDs.indexOf(req.params.role_id);
								/*console.log(index);*/
								apps[a].roleIDs.splice(index, ++index);
								/*console.log(apps[a].roleIDs)*/
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
										/*console.log(project.num_roles);*/
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
				role.age = req.body.age;
				role.compensation = req.body.compensation;
				role.union = req.body.union;
				role.description = req.body.description;
				role.ethnicity = req.body.ethnicity;
				role.end_date = req.body.end_date;
				role.end_time = req.body.end_time;
				role.location = req.body.location;
				role.name = req.body.name;
				role.payterms = req.body.payterms;
				role.projectID = req.body.projectID;
				role.usage = req.body.usage;

				role.sex = req.body.sex;
				role.requirements = req.body.requirements;
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
			project.user = req.decoded.name //User Name
			project.name = req.body.name;
			project.location = req.body.location;
			project.description = req.body.description
			project.coverphoto = req.body.coverphoto
			project.usage = req.body.usage

			project.save(function(err, project) {
				if (err) {
					return res.json({
						success: false,
						error: err
					})
				}
				res.json({
					success: true,
					projectID: project._id,
					message: 'Project created.'

				});
			})
		})
		//get all projects belong to user
		.get(function(req, res) {
			User.findById(req.decoded.id, function(error, user) {
				if (error) return;
				var projectIDs = []

				Project.find({
					"user_id": req.decoded.id
				}, function(err, projects) {
					//TODO: remove after out of beta
					for (var i in projects) {
						var project = projects[i];
						if (!project.user) {
							project.user = req.decoded.name;
							project.save();
						}
					}

					Project.find({
						"collabs_id.userID": req.decoded.id,
					}, function(err, guestProjects) {
						if (err) {
							res.send(err);
						} else {
							res.json({
								'success': true,
								'data': projects.concat(guestProjects)
							});
						}
					});

				})
			})


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
				/*if (req.body.name)*/ project.name = req.body.name;
				/*if (req.body.usage)*/ project.usage = req.body.usage;
				/*if (req.body.location)*/ project.location = req.body.location;
				/*if (req.body.updated_date)*/ project.updated_date = req.body.updated_date;
				/*if (req.body.coverphoto)*/ project.coverphoto = req.body.coverphoto;
				/*if (req.body.description)*/ project.description = req.body.description;
				/*else project.description = null;*/
				project.save(function(err) {
					if (err) console.log(err);
					if (err) res.send(err);
					else {
						res.json({
							success: true,
							projectID: project._id,
						});
					}
				})
			})
		})

	.delete(function(req, res) {
		Role.find({
			projectID: req.params.project_id
		}, function(err, roles) {
			/*console.log(roles)
			console.log(roles.length)*/
			if (roles) {
				//check if roles belong to user
				if (roles[i] && roles[i].userID !== req.decoded.id) {
					return res.json({
						success: false,
						message: "Invalid request"
					})
				}

				for (var i in roles) {
					Applicant.find({
						roleIDs: {
							$in: [roles[i]._id]
						}
					}, function(err, apps) {
						/*console.log(apps)*/
						if (err) console.log(err);
						else {
							for (var a in apps) {
								/*console.log(apps[a].roleIDs.length);*/
								console.log("roleIDs: " + apps[a].roleIDs.length)
								if (apps[a].roleIDs.length <= 1) {
									/*console.log(apps[a].suppliments)*/
									aws.removeSup(apps[a].suppliments);
									apps[a].remove();
								} else {
									/*console.log(roles[i]._id)*/
									var index = apps[a].roleIDs.indexOf(roles[i]._id);
									/*console.log(index)*/
									apps[a].roleIDs.splice(index, ++index);
									/*console.log("roleIDs: " + apps[a].roleIDs.length)*/
									apps[a].save();
								}
							}
						}
					})
					roles[i].remove();
				}
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
				/*console.log(user)*/
				if (!user || !user._id) {
					return res.status(403).send({
						success: false,
						message: 'Failed to authenticate token.'
					});
				} else {
					var money = {}
					money.name = user.name;
					money.role = user.role;
					money._id = user._id;
					/*res.json({
						data: money
					});*/
				}
				var money = {}
				money.name = user.name;
				money.email = user.email;
				money.role = user.role;
				money._id = user._id;
				money.invites = user.invites;
				money.notifications = user.notifications;
				res.json({
					data: money
				});

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
				if (req.body.email) user.email = req.body.email;
				if (req.body.name) user.name = req.body.name;
				/*if (req.body.username) user.username = req.body.username;*/
				if (req.body.password) user.password = req.body.password;

				user.save(function(err) {
					if (err)
						if (err.code == 11000)
							return res.json({
								success: false,
								message: 'A user with that email already exists.'
							});
						else
							return res.json({
								success: false,
								message: 'Error occured. Please try again at a later time.',
								error: err
							});

					else {
						var token = jwt.sign({
							id: user.id,
							name: user.name,
						}, config.secret, {
							expiresIn: 86400
						}); //24 hrs
						return res.json({
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
				return res.json({
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
	apiRouter.route('/user/settings')
		.put(function(req, res) {
			User.findById(req.decoded.id, function(err, user) {
				/*console.log(user.views)*/
				switch (req.body.page) {
					case "role":
						user.views.role = req.body.view;
						break;
					case "home":
						user.views.home = req.body.view;
						break;
				}
				user.save()
					/*console.log(user.views)*/


				/*				console.log("Reached api")*/
				/*console.log(req)
				console.log(res)*/
				return res.json({
					success: true
				})
			})
		})
		.get(function(req, res) {
			User.findById(req.decoded.id, function(err, user) {
				var temp = {};
				if (!err) {
					switch (req.body.page) {
						case "role":
							temp = user.views.role;
							break;
						case "home":
							temp = user.views.role;
							break;
					}
					return res.json({
						success: true,
						view: temp
					})
				}
			})
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
			})
		});
	return apiRouter;
}