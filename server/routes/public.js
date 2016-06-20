'user strick';
var User = require("../models/user");
var PassReset = require("../models/passReset");
var Invite = require("../models/invite")
var EmailConfirmation = require("../models/emailConfirmation")
var Project = require("../models/project");
var Role = require("../models/role");
var Applicant = require("../models/applicant");
var config = require("../../config").dev;
var path = require('path');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var Mailgun = require("mailgun-js");
var S3Config = require('./../aws.json');
var aws = require('../../server/lib/aws');
var bitly = require("../lib/bitly.js")
var async = require('async');

module.exports = function(app, express) {
  var app = express.Router();

  app.all('*', function(req, res, next) {
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
              data.email = data.email.toLowerCase()
              decoded.name = data.name;
              data.last_active = new Date();
              data.save();
              return data;
            }
          })
          req.decoded = decoded;
          next();
        }
      });
    } else {

      req.decoded = false;
      next();
    }
  });

  app.route('/')
    .get(function(req, res) {
      res.sendFile(path.join(__dirname + '../../../public/app/views/index.html'));
    })
  app.get('/config', function(req, res) {
    return res.json({
      success: true,
      awsConfig: {
        bucket: S3Config.bucket
      }
    })
  });
  app.get('/s3Policy', aws.getS3Policy);

  app.get('/public/role/:role_id', function(req, res) {
    //find role data, then find project data before returning result
    Role.findById(req.params.role_id, function(err, role) {
      if (err || role === null) {
        return res.json({
          success: false,
          error: err
        });
      } else {
        Project.findById(role.projectID, function(err, proj) {
          var checkClientship = function(prj, decoded) {
            if (!decoded) return "public";
            else {
              //check if requester is owner
              if (prj.user_id === decoded.id) {
                return "owner"
              } else {
                for (var i in prj.collabs_id) {
                  var collab = prj.collabs_id[i];
                  if (collab.userID === decoded.id) {
                    return "collab";
                  }
                }
                return "public";
              }
            }
          }
          var client = checkClientship(proj, req.decoded);
          /*if (client === "owner") {*/
          return res.json({
            success: true,
            client: client,
            data: role,
            project: proj,
          });
          /*}
          else{ 
            return res.redirect("/Apply/"+req.params.role_id)
          }*/
        })
      }
    })
  })

  app.get('/public/project/:project_id', function(req, res) {
    Project.findById(req.params.project_id, function(err, proj) {
      if (!proj) return res.json({
        success: false,
        error: err
      });
      else {
        /*for(var i in proj.collabs_id){
          if(!proj.collabs_id[i].userName){
            proj.collabs_id.splice(i,1);
            proj.collabs_id.shift()
          }
        }
        proj.save();*/
        if (!proj.user) proj.user = req.decoded.name;

        var checkClientship = function(prj, decoded) {
            if (!decoded) return "public";
            else {
              //check if requester is owner
              if (prj.user_id === decoded.id) {
                return "owner"
              } else {
                for (var i in prj.collabs_id) {
                  var collab = prj.collabs_id[i];
                  if (collab.userID === decoded.id) {
                    return "collab";
                  }
                }
                return "public";
              }
            }
          }
          //make sure there's a short_link
        if (!proj.short_url) {
          var URL = config.baseURL + "/Apply/Project/";
          bitly.shortenProjectURL(URL + proj._id, proj._id,
            function(data) {});
        }

        Role.find({
          projectID: proj._id
        }, function(err, roles) {
          /*console.log(roles[0].requirements)*/

          var money = {};
          var client = checkClientship(proj, req.decoded);
          money.client = client;
          money.roles = roles;
          money.project = proj;
          return res.json({
            success: true,
            client: client,
            project: money
          });
        });
      }
    })
  })

  app.post('/applicant', function(req, res) {
    var applicant = new Applicant();
    //check for correct name;
    if (req.body.name) {
      if (req.body.name.first) {
        applicant.name.first = req.body.name.first;
      }
      if (req.body.name.last) {
        applicant.name.last = req.body.name.last;
      }
    }
    if (!req.body.roleIDs) {
      return res.json({
        success: false,
        error: "No roleIDs"
      })
    } else {
      for (id in req.body.roleIDs) {
        applicant.roleIDs.push(req.body.roleIDs[id]);
      }
    }
    if (req.body.agent) {
      applicant.agent = req.body.agent;
    }
    if (req.body.email) {
      applicant.email = req.body.email;
    }
    if (req.body.phone) {
      applicant.phone = req.body.phone;
    }
    if (req.body.gender) {
      applicant.gender = req.body.gender;
    }
    if (req.body.message) {
      applicant.message = req.body.message;
    }
    if (req.body.links) {
      for (link in req.body.links) {
        applicant.links.push(req.body.links[link]);
      }
    }

    if (req.decoded.id) {
      applicant.createID = req.decoded.id;
    }

    applicant.save(function(err) {
      if (err) {
        return res.json({
          success: false,
          error: err
        })
      } else {
        if (req.body.roleIDs && req.body.roleIDs[0]) {
          for (i in req.body.roleIDs) {
            var roleID = req.body.roleIDs[i];

            async.map(req.body.roleIDs, updateCount, function(e, r) {
              /*console.log("printing results after saving")
              console.log(r);*/
              return;
            });

            function updateCount(roleID, callback) {
              Role.findById(roleID, function(err, role) {
                /*console.log("line 197:found role")*/
                if (!err) {
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
                    if (err) return callback(err, null);
                    else {
                      role.total_apps = count;
                      /*console.log(role.total_apps);*/
                      role.save(function(err, data) {});
                      return callback();
                    }
                  })
                }
              })
            }
          }
        }
        return res.json({
          success: true,
          appID: applicant._id
        })
      }
    })
  })
  app.put('/resetPass/:email', function(req, res) {
    /*console.log("HELLLLO")*/

    var usrEmail = req.params.email;
    User.findOne({
      email: usrEmail
    }, function(err, user) {
      if (user) {
        var pass = new PassReset();
        pass.userID = user._id;
        pass.email = user.email;
        pass.save()

        var data = {
          from: "friends@bittycasting",
          to: user.email,
          subject: "BittyCasting: Password Reset Request",
          html: "Please follow the link to reset your password: " + "https://staging.bittycasting.com/reset/password/" + pass._id,
        }

        var mailgun = new Mailgun({
          apiKey: config.api_key,
          domain: config.domain
        });

        mailgun.messages()
          .send(data, function(err, body) {
            if (err) {
              return res.json({
                success: false,
                message: "An error occured. Please try again."
              });
            } else {
              return res.json({
                success: true,
                message: "An email is sent to your account"
              });
            }
          });
      } else {
        return res.json({
          success: false,
          message: "Dones't look like this email exists in our system"
        });
      }
    })
  })
  app.put('/suppliment/:app_id', function(req, res) {
    Applicant.findById(req.params.app_id, function(err, app) {
      if (err) res.json({
        Error: true,
        error: err
      });
      if (app) {
        app.suppliments.push({
          source: req.body.location,
          name: req.body.name,
          key: req.body.key,
          file_type: req.body.file_type
        });
        app.save(function(err) {
          if (err) {
            return res.json({
              success: false,
              error: err
            })
          } else {
            return res.json({
              success: true,
              message: "Added new subppliment"
            });
          }
          return res.json({
            success: true,
            message: 'updated'
          });
        })
      }
    });
  })
  app.put('/feedback', function(req, res) {
    var tStamp = req.body.timestamp
    var data = {
      from: "internal@bittycasting.com",
      to: "support@bittycasting.com",
      subject: "Beta User Feedback - " + req.body.title,
      html: 'New user feedback: ' + req.body.message + " " + "User Information: " + "<br>" +
        req.body.user.first + " " + req.body.user.last + " " +
        req.body.user.email + "." + "Timestamp: " + tStamp + " " +
        "Request was sent from: " + req.body.location
    }

    var mailgun = new Mailgun({
      apiKey: config.api_key,
      domain: config.domain
    });
    mailgun.messages()
      .send(data, function(err, body) {
        if (err) {
          console.log(err)
        } else {
          return res;
        }
      });
  });

  app.put('/submit/:mail', function(req, res) {
      /*console.log(req.params.mail);*/
      //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
      var mailgun = new Mailgun({
        apiKey: config.api_key,
        domain: config.domain
      });

      var data = {
          //Specify email data
          from: "internal@bittycasting.com",
          //The email to contact
          to: "support@bittycasting.com",
          //Subject and text data  
          subject: 'New Beta Customer',
          html: 'Beta Request ' + req.params.mail
        }
        //Invokes the method to send emails given the above data with the helper library
      mailgun.messages().send(data, function(err, body) {
        /*console.log(body)*/
        //If there is an error, render the error page
        if (err) {
          console.log(err)
        } else {
          //Here "submitted.jade" is the view file for this landing page 
          //We pass the variable "email" from the url parameter in an object rendered by Jade
          /*console.log(body)*/
          /*res.json(body);*/
          /*  res.render('submitted', { email : req.params.mail });
            console.log(body);*/
        }
      })
    })
    /*  })
    });*/

  app.route('/register/resend/:confirmID')
    .get(function(req, res) {
      EmailConfirmation.findOne({
        _id: req.params.confirmID
      }, function(err, data) {
        if (!data) return res.json({
          success: false,
          error: err
        })
        else {
          //reset create_date instead of creating a new EmailConfirmation object. 
          data.create_date = new Date();
          data.save();

          var data = {
              from: "Registration@BittyCasting.com",
              to: data.email,
              subject: "New Registration",
              html: "You have been added to our Beta list. " + "You can now access your account at " + "https://bittycasting.com/ " + "Thank you for you support.",
            }
            /*html: "Please follow this link to finish your Bittycasting registration." + "https://bittycasting.com/confirm/user/" + data._id,*/
          var mailgun = new Mailgun({
            apiKey: config.api_key,
            domain: config.domain
          });

          mailgun.messages()
            .send(data, function(err, body) {
              if (err) {
                return res.json({
                  success: false,
                  error: err
                });
              } else {
                return res.json({
                  success: true,
                  message: 'An email is sent to you.'
                });
              }
            });
          //resend email

          /*var curData = new Date();
          var daysOld = (curData - data.create_date);
          daysOld = Math.ceil(daysOld / (1000 * 3600 * 24));*/
        }
      })
    })

  app.route('/register/confirm/:confirmID')
    .get(function(req, res) {
      EmailConfirmation.findOne({
        _id: req.params.confirmID
      }, function(err, data) {
        //when confirmation never existed
        if (!data) {
          return res.json({
            success: false,
            invalid: true,
            message: "Invalid Request"
          });
        }
        //expired token
        else if (data) {
          data.remove()

          var DURATION = 14; //days
          var curData = new Date();
          var daysOld = (curData - data.create_date);
          daysOld = Math.ceil(daysOld / (1000 * 3600 * 24));
          if (daysOld > DURATION) {
            return res.json({
              success: false,
              message: "Your confirmation email is expired. " + "Resubmit your email to receive another confirmation email."
            });
          }
          //Invitation found
          else {
            User.findOne({
                _id: data.userID
              }).select('name email password')
              .exec(function(err, user) {
                user.isValidated = true;
                user.save();

                if (err) throw err;
                if (!user) {
                  return res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                  });
                }
                var token = jwt.sign({
                  id: user.id,
                  name: user.name,
                }, config.secret, {
                  expiresIn: 86400 //  (24hrs)
                    // expires in 3600 * 24 = c (24 hours)
                });
                //return the information including token as JSON
                return res.json({
                  success: true,
                  name: user.name,
                  message: 'Enjoy your token!',
                  token: token
                });
                /*}*/

              });
          }
        }
      })
    })

  app.route('/login')
    .post(function(req, res) {
      /*console.log(req.body);*/
      User.findOne({
        email: req.body.email
      }).select('name email password isValidated').exec(function(err, user) {
        if (err) throw err;
        if (!user) {
          res.json({
            success: false,
            message: 'Authentication failed. User not found.'
          });
        } else if (user) {
          if (user.isValidated === false) {
            /*var validPassword = user.comparePassword(req.body.password);*/
            /*if (!validPassword) {*/
            res.json({
              success: false,
              message: 'You account has not been validated. Please check your email, and follow the link provided to complete your email validation.'
            });
          } else {
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
              res.json({
                success: false,
                message: 'Authentication failed. Wrong password.'
              });
            } else {

              var token = jwt.sign({
                id: user.id,
                name: user.name,
              }, config.secret, {
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
        }
      });
    });
  app.route('/register')
    .post(function(req, res) {
      //create a new instance of the User model
      var user = new User();
      var confirmation = new EmailConfirmation();
      confirmation.userID = user._id;
      confirmation.email = req.body.email;
      confirmation.save();

      //set the users information (comes from the request)
      var name = req.body.name;
      var arrName = name.split(' ');
      var fname = name.split(" ")[0]
      var lname = name.split(" ")[arrName.length - 1]

      if (arrName.length < 2) {
        return res.json({
          success: false,
          message: "User name invalid."
        })
      } else if (arrName.length === 2) {
        user.name = ({
          first: fname[0].toUpperCase() + fname.toLowerCase().slice(1),
          last: lname[0].toUpperCase() + lname.toLowerCase().slice(1)
        })
      } else if (arrName.length > 2) {
        var middleName = "";
        //extract middle name
        for (var i in name.split(' ')) {
          if (i > 0 && i < arrName.length - 1) {
            middleName += name.split(' ')[i] + " ";
          }
        }
        middleName = middleName.trim();
        user.name = ({
          first: fname[0].toUpperCase() + fname.toLowerCase().slice(1),
          middle: middleName,
          last: lname[0].toUpperCase() + lname.toLowerCase().slice(1)
        })
      }
      /*console.log(req.body.name)
      console.log(user.name)*/


      /*user.name.last = req.body.name.last;
      user.name.first = req.body.name.first;*/
      user.password = req.body.password;
      user.email = req.body.email;
      user.role = "user";
      user.isValidated = false;

      user.save(function(err, user) {
        console.log(err)
        console.log(user)
        if (err) {
          console.log(err);
          //duplicate entry
          if (err.code == 11000)
            return res.json({
              success: false,
              message: 'A user with that email already exists.'
            });
        } else {
          var data = {
            from: "Registration@BittyCasting.com",
            to: req.body.email,
            subject: "Confirm: New Registration",
            html: user.name.first[0].toUpperCase() + user.name.first.toLowerCase().slice(1) +
              ', please follow this link to finish your Bittycasting registration. ' +
              "https://bittycasting.com/confirm/user/" + confirmation._id,
          }
          var mailgun = new Mailgun({
            apiKey: config.api_key,
            domain: config.domain
          });

          mailgun.messages()
            .send(data, function(err, body) {
              if (err) {
                return res.json({
                  success: false,
                  error: err
                });
              } else {
                return res.json({
                  success: true,
                  message: 'An email is sent to you. Please verify your email to complete your registration'
                });
              }
            });
        }
      })

    });
  app.route('/register/invitation/:inviteID')
    .put(function(req, res) {
      /*console.log(req.body)*/
      Invite.findById(req.params.inviteID, function(err, invite) {
        var user = new User();
        var name = req.body.name;

        var arrName = name.split(' ');

        if (arrName.length < 2) {
          return res.json({
            success: false,
            message: "User name invalid."
          })
        } else if (arrName.length > 2) {
          var middleName = "";
          //extract middle name
          for (var i in name.split(' ')) {
            if (i > 0 && i < arrName.length - 1) {
              middleName += name.split(' ')[i] + " ";
            }
          }

          var fname = name.split(" ")[0]
          var lname = name.split(" ")[arrName.length - 1]

          user.name = ({
            first: fname[0].toUpperCase() + fname.toLowerCase().slice(1),
            middle: middleName.trim(),
            last: lname[0].toUpperCase() + lname.toLowerCase().slice(1)
          })
        }

        user.password = req.body.password;
        user.email = req.body.email;
        user.role = "user";
        if (invite) {
          invite.remove();
          user.invites.push(invite.projectID)

          user.save(function(err, user) {
            if (err) {
              //duplicate entry
              if (err.code == 11000)
                return res.json({
                  success: false,
                  message: 'A user with that email already exists.'
                });
              else
                return res.send(err);
            } else {
              /*if (invite) {*/
              Project.findById(invite.projectID, function(err, project) {
                  if (err) return;
                  project.collabs_id.push({
                    userID: user._id,
                    userName: user.name,
                    userProfilePhoto: user.profile,
                  })
                  project.save();
                  return
                })
                /*}*/
              var token = jwt.sign({
                id: user.id,
                name: user.name,
              }, config.secret, {
                expiresIn: 86400 //  (24hrs)
                  // expires in 3600 * 24 = c (24 hours)
              });

              return res.json({
                success: true,
                message: 'User created!',
                token: token
              });
            }
          });
        } else {
          return res.json({
            success: false,
            message: 'Could not find invitation'
          });
        }
      })
    });
  return app;
}