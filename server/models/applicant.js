var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicantSchema = new Schema({
	updated_date: {type:Date, default:Date.now},
	name : { first: String, last: String },
	email:{
		type:String,
		required:true,
	},
	phone:{
		type:Number,
		required:false,
	},
	projectID:{
		type:String,
		required:false,
	},
	roleID:{
		type:String,
		required:false,
	},
	suppliments:[{
		name:{
			type:String, 
			required:false},
		content:{
			type:String,
			required:false}
	}]
});

module.exports = mongoose.model('Applicant',ApplicantSchema);
