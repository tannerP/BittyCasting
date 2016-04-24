var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicantSchema = new Schema({
	updated_date: {type:Date, default:Date.now},
	submission_date:{type:Date, default:Date.now},
	name : { first: String, last: String },
	age : String,
	gender : String,
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
	comments:[{
		owner:String,
		comment:String
	}],
	links:[{}],
	suppliments:[{
		source:String,
		name:String,
		key:String,
		file_type:String,
	}]
});


module.exports = mongoose.model('Applicant',ApplicantSchema);
