//server.js
'user restrict'
//==================================--BASE SETUP--============================
//LOAD PACKAGES-------------------------------
//var jwt = require('jsonwebtoken');//TOKEN Package
var Role = require('./server/models/role');
var Project = require('./server/models/project');
var Applicant = require('./server/models/applicant');
var express = require ('express'); //EXPRESS Package
var app = express();	//define our app using express
var bodyParser = require('body-parser');// get body-parser
var morgan = require('morgan'); //use to see requests
var mongoose = require('mongoose') //for working with mongoDB
var path = require('path');
var User = require(__dirname + '/server//models/user.js');
var config = require('./config'); //get config file
var S3Config = require('./aws.json');
var aws = require('./server/lib/aws');
/*var io = require('socket.io')(app);*/


//var port = config.port; //PORT

app.use(morgan('dev')); //HTTP logger

//==================================--APP--====================================
app.use(bodyParser.urlencoded({ extended:true}));
app.use(bodyParser.json());

//configure app to handle CORS requests
app.use(function(req,res,next){
	res.setHeader('Access-Control-Allow-Orgin','*');
	res.setHeader('Access-Control-Allow-Method','GET,POST');
	res.setHeader('Access-Control-Allow-Headers','X-Request-With,content-type,\Authorization');
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  res.setHeader('Cache-Control', 'public, max-age=31557600');
  res.setHeader('Cache-Control', 'private, max-age=31550');
	next();
});

//==================================--DB--====================================

var dbPath  = "mongodb://" +
    config.HOST + ":"+
    config.PORT + "/"+	
    config.DATABASE;

/*mongoose.connect('mongodb://localhost/local');*/
mongoose.connect(dbPath);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('MONGO: successfully connected to db');
});

var apiRoutes = require(__dirname + '/server/routes/api')(app,express);
var publicRoutes = require(__dirname + '/server/routes/authentication')(app,express);

app.use(express.static(__dirname + '/public'));
/* S3 Config*/
app.get('/s3Policy',aws.getS3Policy);
app.get('/config', function(req,res){
    return res.json({success:true, awsConfig: {
            bucket: S3Config.bucket
        }
        })
  });
  app.get('/appRole/:role_id', function(req,res){
    Role.findOne({_id:req.params.role_id}, function(err, data){
      if(!err){
      res.json({success:true, data:data});
    }})
  });
  app.get('/appPrj/:project_id', function(req,res){
    Project.findById(req.params.project_id, function(err,proj){
      res.json({success:true, project:proj});
    })
  });
   app.post('/applicant',function(req,res){
        var applicant = new Applicant();
        
        applicant.projectID = req.body.projectID;
        applicant.roleID = req.body.roleID;
        if(req.body.name.first){
        applicant.name.first = req.body.name.first;
        }
        if(req.body.name.last){
        applicant.name.last = req.body.name.last;
        }
        if(req.body.email){
        applicant.email = req.body.email;   
        }
        if(req.body.phone){
        applicant.phone = req.body.phone;
        }
        
        applicant.save(function(err){
          if(err){
            return  res.json({success:false,
                error: err})  }
          else{
          Applicant.findOne({'email':req.body.email}, function(err, data){
          if(err) return  res.json({success:false,
                error: err}) 
            return res.json({success:true, appID:data._id});
        });
        }
      })
    });
   app.put('/applicant',function(req,res){

   });

   /* Project.findById(req.params.project_id, function(err,proj){
      res.json({success:true, project:proj});
    })
    */
app.use('/',publicRoutes); 
app.use('/api',apiRoutes); 
app.all('/*', function(req, res, next){
  res.sendFile(path.join(__dirname+"/public/app/views/index.html"))
})

app.listen(config.port);

/*io.on('connection', function(socket){
	console.log('a user connected');
})
*/
console.log("Magic happens on port" + config.port);




