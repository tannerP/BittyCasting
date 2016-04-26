var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	user : {}, 
	users:[{
		user_id:String, 
		role:String,
	}],
	coverphoto: {},
	updated_date: {type:Date, default:Date.now},
	user_id : String, 
	num_roles: {type:Number, default:0},
	name : {
		type: String, 
	},
	description:{
		type: String,
	}
	});

module.exports = mongoose.model('Project',ProjectSchema);