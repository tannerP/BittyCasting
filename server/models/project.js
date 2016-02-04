var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	user : String, 
	user_id : String, 

	name : {
		type: String, 
		require : true,
		index: {unique:true}
	},
	details: String,
	role_ids : {
		//how to add an array of IDs? 
		type: Array
	}

});
module.exports = mongoose.model('Project',ProjectSchema);