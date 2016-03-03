var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicantSchema = new Schema({
	updated_date: {type:Date, default:Date.now},
	name : {first:String,last:String},
	email:{
		type:String,
		required:true,
		index:{	unique:true	}
	},
	phone:{
		type:Number,
		required:false,
	},
	suppliments:[{
		name:{
			type:String, 
			required:true},
		content:{
			type:String,
			required:true}
	}]
});

module.exports = mongoose.model('Applicant',ApplicantSchema);
