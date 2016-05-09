var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	user : {}, 
	user_id : String,
	collabs_id:[{
	}], 
	coverphoto: {},
	short_url: String,
	updated_date: {type:Date, default:Date.now},
	num_roles: {type:Number, default:0},
	name : {
		type: String, 
	},
	description:{
		type: String,
	}
	});

module.exports = mongoose.model('Project',ProjectSchema);