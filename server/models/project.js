var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	user : {}, 
	user_id : String,
	admin:[{
	}],
	collabs_id:[{
				userID:String,
				userName:{},
				userProfilePhoto:{},
				accepted:{type:Boolean,default:false},
				responded:{type:Boolean,default:false},
			}], 
	coverphoto: {},
	short_url: String,
	updated_date: {type:Date, default:Date.now},
	num_roles: {type:Number, default:0},
	name : {
		type: String, 
	},
	description:{
		type: String,
	}
	});

module.exports = mongoose.model('Project',ProjectSchema);