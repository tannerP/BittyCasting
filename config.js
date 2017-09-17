


exports.tp = {
	'port': process.env.PORT || 8000,
  "baseURL":"http://bittycasting.com",
	secret: "Hello 2016",
  "USER"    : "",           
  "PASS"    : "",
  "HOST"    : "127.0.0.1",  
  /*"HOST"     : "54.191.157.140",*/
  "PORT"    : "27017", 
  "DATABASE" : "dev",
};

exports.dev = {
  'port': process.env.PORT || 8000,
  "baseURL":"http://bittycasting.com",
  secret: "Hello 2016",
  "USER"    : "",           
  "PASS"    : "",
  "HOST"    : "54.201.242.215",  
  "PORT"    : "27017", 
  "DATABASE" : "dev",
};

exports.prod = {
  'port': process.env.PORT || 8000,
  "baseURL":"http://bittycasting.com",
  "USER"    : "",           
  "PASS"    : "",
  "HOST"     : "54.201.242.215",
  "PORT"    : "27017", 
  "DATABASE" : "prod",
};
