var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoleSchema = new Schema({
	updated_date: {
		type:Date,
		default:Date.now
	},
	end_date: { 
		type:Date,
		default:Date.now
		},
	end_time: { 
		type:Date,
		default:Date.now },
	ethnicity:String,
	created_date:{ type:Date, default:Date.now },
	userID: { type: String, required: true },
	projectID:{ type: String, required: true },
	name: { type:String, required: true},
	description: { type:String, require:true },
	union: { type:String},
	
	short_url:{ type:String},
	compensation: String,
	total_apps: { type:Number, default:0 },
	new_apps: { type:Number, default:0 },
	age: { type:String, min:0, max:90 },
	usage:String, 
	location:String,
	sex: { type:String },
	requirements:[{
		name:String,
		format:String,
		required:Boolean
	}]
});



module.exports = mongoose.model('Role',RoleSchema);