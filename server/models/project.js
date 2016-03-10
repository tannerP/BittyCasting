var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	user : {}, 
	updated_date: {type:Date, default:Date.now},
	user_id : String, 

	Project : {
		type: String, 
		required : true,
		index: {unique:true}
	},
	Description:{
		type: String,
		required:true
	}
	});

module.exports = mongoose.model('Project',ProjectSchema);