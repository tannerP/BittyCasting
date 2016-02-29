var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	user : {}, 
	updated_date: {type:Date, default:Date.now},
	user_id : String, 

	name : {
		type: String, 
		required : true,
		index: {unique:true}
	},
	description:{
		type: String,
		required:true
	}
	});

module.exports = mongoose.model('Project',ProjectSchema);