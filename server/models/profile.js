var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicantSchema = new Schema({
	uiPreferences:{},
	deleted:{type:Boolean, default: false},
	birth_date: {type:Date, default:Date.now},
	profile_photo:{},
	
})