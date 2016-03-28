var config = require('./../../config.js');
var BitlyAPI = require("node-bitlyapi");
var Role = require('../models/role');
var Bitly = new BitlyAPI({
		client_id:config.bitly_id,
		client_secret:config.bitly_secret
})
Bitly.setAccessToken(config.bitly_access_token);
/*console.log(config.bitly_access_token)*/

/*var Bitly = require('bitly');
var bitly = new Bitly(config.bitly_access_token);*/

exports.shortenURL = function(url, RoleID){
	/*console.log(config.bitly_access_token)*/
	if(RoleID){
		Bitly.shortenLink(url,function(err,res){
			if(res){
				/*console.log(JSON.parse(res).data.url);*/
				//putting short url to role
				Role.update({_id:RoleID},{
					short_url:JSON.parse(res).data.url
				},function(err,data){
				if(!err)console.log("successful added short link")/*does nothing*/})
				return res;	}
			else{
				throw err;		
			}
		})
}
else(
	console.log("No role id")
	)
	/*bitly.shorten(url)
	  .then(function(response) {
	    console.log(response)
	    return response.data.url;

	    // Do something with data
	  }, function(error) {
	    throw error;
	  });*/
}