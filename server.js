//server.js
'user restrict'
//==================================--BASE SETUP--============================
//LOAD PACKAGES-------------------------------
//var jwt = require('jsonwebtoken');//TOKEN Package
var fs = require('fs');
var https = require("https");
/*var privateKey = fs.readFileSync('key.pem');
var certificate = fs.readFileSync('key-cert.pem');*/

/*var options = { key:privateKey,
                cert: certificate
              };*/

var Role = require('./server/models/role');
var Project = require('./server/models/project');
var Applicant = require('./server/models/applicant');
var express = require('express'); //EXPRESS Package
var app = express(); //define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); //use to see requests
var mongoose = require('mongoose') //for working with mongoDB
var path = require('path');
var User = require(__dirname + '/server//models/user.js');
var extend = require("extend");
app.use(require('prerender-node').set('prerenderToken', 'QyDUvf8RhPXGiwzgHUS4'));


app.use(require('prerender-node')
  .set('prerenderToken', 'QyDUvf8RhPXGiwzgHUS4'));


var env = process.argv[2];

/*console.log(env)*/
switch (env) {
  case "prod":
    var config = require('./config').prod; //get config file
    break;
  case "tp":
    var config = require('./config').tp; //get config file
    app.use(morgan('dev')); //HTTP logger
    break;
  default:
    var config = require('./config').dev; //get config file
    app.use(morgan('dev')); //HTTP logger
    break;

}

/*var io = require('socket.io')(app);*/

//var port = config.port; //PORT

//==================================--APP--====================================
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//configure app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Orgin', '*');
  res.setHeader('Access-Control-Allow-Method', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers',
    'X-Request-With,content-type,\Authorization');
  /*  res.setHeader('Last-Modified', (new Date()).toUTCString());*/
  /*res.setHeader('Cache-Control', 'public, max-age=3155'); */
  next();
});

//==================================--DB--====================================

var dbPath = "mongodb://" +
  config.HOST + ":" +
  config.PORT + "/" +
  config.DATABASE;
/*console.log(dbPath);*/
/*mongoose.connect('mongodb://localhost/local');*/
mongoose.connect(dbPath);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
  console.log('MONGO: successfully connected to db');
});

var apiRoutes = require(__dirname + '/server/routes/api')(app, express);
var publicRoutes = require(__dirname + '/server/routes/public')(app, express);

app.use(express.static(__dirname + '/public'));
/* S3 Config*/

app.use('/', publicRoutes);
app.use('/api', apiRoutes);
app.all('*', function(req, res, next) {
  res.sendFile(path.join(__dirname + "/public/app/views/index.html"))
})
app.listen(config.port, "0.0.0.0");

/*var server = https.createServer(options, app);
    server.listen(config.port, "0.0.0.0");*/

/*console.log(server);*/
/*});*/

/*io.on('connection', function(socket){
	console.log('a user connected');
})
*/