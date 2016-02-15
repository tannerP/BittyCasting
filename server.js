//server.js
'user restrict'
//==================================--BASE SETUP--============================
//LOAD PACKAGES-------------------------------
//var jwt = require('jsonwebtoken');//TOKEN Package
var express = require ('express'); //EXPRESS Package
var app = express();	//define our app using express
var bodyParser = require('body-parser');// get body-parser
var morgan = require('morgan'); //use to see requests
var mongoose = require('mongoose') //for working with mongoDB
var config = require('./config'); //get config file
var path = require('path');
var User = require(__dirname + '/server//models/user.js');
var BinaryServer = require('binaryjs').BinaryServer;
var http         = require('http');

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
app.use('/',publicRoutes); 
app.use('/api',apiRoutes); 
app.all('*', function(req, res, next){
	res.sendFile(path.join(__dirname+"/public/app/views/index.html"))
})

app.listen(config.port);

console.log("Magic happens on port" + config.port);




