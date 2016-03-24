var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoleSchema = new Schema({
	updated_date: {type:Date, default:Date.now},
	userID: {type: String, required: true },
	projectID:{type: String, required: true },
	name: {type:String, required: true},
	description: {type:String, require:true},
	end_date: {type:String, required:false},
	end_time: {type:String, require:false},
	location: {type:String, require:false},
	payterms: {type:String},
	age: {type:String, min:3, max:90},
	sex: {type:String},
	requirements:[{
		name:String,
		file_type:String,
		required:Boolean,
		selected:Boolean,
	}]
});

module.exports = mongoose.model('Role',RoleSchema);