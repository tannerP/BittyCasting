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
		type:String,
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
		source:String,
		name:String,
		file_type:String,
	}]
});

module.exports = mongoose.model('Applicant',ApplicantSchema);
