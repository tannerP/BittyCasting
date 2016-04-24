var config = require('./../../config.js').dev;
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

exports.shortenURL = function(url, RoleID, callback){
	/*console.log(config.bitly_access_token)*/
	if(RoleID){
		Bitly.shortenLink(url,function(err,res){
			if(res){
				//find and add url to role
				Role.findById(RoleID,function(err, role){
					if(!err){
						role.short_url = JSON.parse(res).data.url;
						role.save(function(err,data){
							if(!err) callback(data);
						})
					}
				})
			}
					/*short_url:JSON.parse(res).data.url*/			
	else console.log("No role id")

})}}
	/*bitly.shorten(url)
	  .then(function(response) {
	    console.log(response)
	    return response.data.url;

	    // Do something with data
	  }, function(error) {
	    throw error;
	  });*/
