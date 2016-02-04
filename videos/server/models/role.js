var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoleSchema = new Schema({
	
	user : {
		type: String, 
		require: true,
	},
	userID: {
		type: String, 
		require: true,
	},
	projectID:{
		type: String, 
		require: true,
	},
	projectname:{
		type: String, 
		require: true,
	},
	name : {
		type:String,
		require: true,
	},
	detail : {
		type: String,
		require: true,
		select: true,
	},
	resume :{
		type: Boolean,
		defail: false,
		require: true,
		select: true, 
	},
	cv_letter :{
		type: Boolean,
		defail: false,
		require: true,
		select: true, 
	},
	headshot :{
		type: Boolean,
		defail: false,
		require: true,
		select: true, 
	},
	video_audition :{
		type: Boolean,
		defail: false,
		require: true,
		select: true, 
	},
	monologue :{
		type: Boolean,
		defail: false,
		require: true,
		select: true, 
	}

});

module.exports = mongoose.model('Role',RoleSchema);