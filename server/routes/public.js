'user strick';
var User = require("../models/user");
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

module.exports = function(app,express){
var app = express.Router();

app.route('/')
	.get(function(req,res){
		res.sendFile(path.join(__dirname+ '../../../public/app/views/index.html'));
	})

app.get('/applicationRole/:role_id', function(req,res){
  //find role data, then find project data before returning result
    Role.findById(req.params.role_id, function(err, role){
      if(!err){
          res.json({success:true, Application:role});
        }
  })})

app.get('/s3Policy',aws.getS3Policy);

app.get('/config', function(req,res){
    return res.json({success:true, awsConfig: {
            bucket: S3Config.bucket
        }
        })
  });

app.get('/applicationPrj/:project_id', function(req,res){
	Project.findById(req.params.project_id,function(err,proj){
      Role.find({projectID:proj._id},function(err,roles){
          var money = {};
          money.roles = roles; 
          money.project = proj;
          console.log(money);
          res.json({success:true, project:money});        
      });
	})
});

app.post('/applicant',function(req,res){
      var applicant = new Applicant();
      console.log(req.body);
      applicant.projectID = req.body.projectID;
      applicant.roleID = req.body.roleID;
      /*Role.findById(req.body.roleID, function(err,role){

      })*/
      if(req.body.name){ 
        if(req.body.name.first){
        applicant.name.first = req.body.name.first;
        }
        if(req.body.name.last){
        applicant.name.last = req.body.name.last;
        }
      }
      else{
        res.json({success:false,
              message: "Error: No user name"}) 
      }
      if(req.body.email){
        applicant.email = req.body.email;   
      }
      if(req.body.phone){
        applicant.phone = req.body.phone;
      }
      /*if(req.body.age){
      applicant.age = req.body.age;
      }*/
      if(req.body.gender){
        applicant.gender = req.body.gender;
      }
      if(req.body.message){
        applicant.message = req.body.message;
        console.log(applicant.message);
      }
      if(req.body.links){
        for(link in req.body.links){
          /*console.log(req.body.links[link]);*/
          /*var temp = ({"name":link.name,"source":link.source})*/
          applicant.links.push(req.body.links[link]);
        }
      /*applicant.links = req.body.links;*/
      }

      /*console.log(applicant);*/
      
      applicant.save(function(err){
        if(err){
          return  res.json({success:false,
              error: err})  }
        else{
          Applicant.findOne({'email':req.body.email}, function(err, data){
          if(err) return  res.json({success:false,
                error: err}) 
          else{
            //Find role and update applicants count
            Role.findById(req.body.roleID, function(err,role){
              /*console.log("Found Role when saving application");
              console.log(role);*/
              if(!err){
                ++role.new_apps;
                ++role.total_apps;
                console.log("Increased app counts");
                role.save(function(err,data){
                  return;
                  /*if(err){
                    return  res.json({success:false,
                        error: err
                      })  
                  }
                  else{
                    return  res.json({success:true,
                        appID: 
                    })*/
            })
          }
          /*return res.json({success:true, message:"Success"});*/
      });
          return  res.json({success:true,
                        appID: data._id})
  }
})}})})
app.put('/app/:app_id', function(req,res){

  if(req.body.status === "new"){
    /*console.log(req.body);*/
    Applicant.findById(req.params.app_id,function(err,app){
      app.new = false
      app.save(function(err,data){
        if(err){
          return  res.json({success:false,
              error: err
            })  }
        else{
          return  res.json({success:true,
              message: "Updated Role new attr"
          });
        }
      return res.json({success:true, message:'updated'});
      })
    }); 
  }
  else if(req.body.status="fav"){
    Applicant.findById(req.params.app_id,function(err,app){
      app.favorited = req.body.favorited;

/*
      app.favorite.userID = req.decoded.id;
*/
      app.save(function(err,data){
        if(err){
          return  res.json({success:false,
              error: err
            })  }
        else{
          console.log("Success updating favorited");
          console.log(data);
          return  res.json({success:true,
              message: "Updated Role fav. attr"
          });
        }
      return res.json({success:true, message:'updated'});
      })
    }); 
  }
});

  app.put('/suppliment/:app_id', function(req,res){
  Applicant.findById(req.params.app_id,function(err,app)
  {
    if(err) res.json({Error:true, error:err});
    if(app){
      app.suppliments.push({
          source:req.body.location,
          name: req.body.name,
          key: req.body.key,
          file_type: req.body.file_type
        });  
      
      app.save(function(err){
        if(err){
          return  res.json({success:false,
              error: err
            })  
        }
        else{
          return  res.json({success:true,
              message: "Added new subppliment"
          });
      }
  return res.json({success:true, message:'updated'});
    })
  }
})
});


app.get('/submit/:mail', function(req,res) {
  console.log(req.params.mail);
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun({apiKey: config.api_key, domain: config.domain});

    var data = {
    //Specify email data
      from: "internal@bittycasting.com",
    //The email to contact
      to: "support@bittycasting.com",
    //Subject and text data  
      subject: 'New Beta Customer',
      html: 'Beta Request' + req.params.mail
    }

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
          console.log(err)
        }
        else {
            //Here "submitted.jade" is the view file for this landing page 
            //We pass the variable "email" from the url parameter in an object rendered by Jade
          console.log(body)
          /*res.json(body);*/
          /*  res.render('submitted', { email : req.params.mail });
            console.log(body);*/
        }
    });

});
app.put('/feedback', function(req,res) {
  var data = {
      from: "internal@bittycasting.com",
      to: "support@bittycasting.com",
      subject: "Beta User Feedback - " + req.body.title,
      html: 'New user feedback: ' + req.body.message + " " + "User Information: " + " " 
      + req.body.user.first + " "
      + req.body.user.last + " "
      + req.body.user.emmail + "."
      + "Timestamp: " + req.body.timestamp
    }
    /*console.log(data);*/
    /*console.log("This is a Get feedback");*/
    /*console.log(req.body);*/
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun({apiKey: config.api_key, domain: config.domain});

/*    var data = {
      from: "internal@bittycasting.com",
      to: "tannerphan@gmail.com",
      subject: "Beta User Feedback - " + req.body.title,
      html: 'New user feedback: ' + req.body.message + "User Info:" + req.body.user.email 
      + " " + req.body.user.first + " " + req.body.user.last + "." + " " + req.body.timestamp
    }*/
    mailgun.messages().send(data, function (err, body) {
        if (err) {
          console.log(err)
        }
        else {
          console.log(body)
          return res
        }
    });

});

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
					message:'Authentication failed. User not found.'
				});
			}else if (user){
				
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.json({
						success: false,
						message: 'Authentication failed. Wrong password.'
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
		user.name.last = req.body.name.last;
		user.name.first = req.body.name.first;
		user.password = req.body.password;
		user.email = req.body.email;
		user.role = "user";
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