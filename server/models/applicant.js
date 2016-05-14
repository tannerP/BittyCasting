var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicantSchema = new Schema({
	creatorID:{type:String, default: "applicant"},
	updated_date: {type:Date, default:Date.now},
	submission_date:{type:Date, default:Date.now},
	/*new : [{
		:Boolean
	}],*/
	name : { first: String, last: String },
	favorited :{type:Boolean, default:false},
	favs : [{
			roleID:String,
			userID:String,
			favorited:Boolean,
	}],
	age : String,
	message : {type:String, max:220},
	gender : String,
	email:{
		type:String,
		required:false,
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
	roleIDs:[{
		type:String,
		required:false,
	}],
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
