var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	createdAt: { type: Date, expires: '14d' },
	notify: Boolean,
	notify_type:String,
	userID : String,
	guestID : String, 
	guestEmail: String,
	projectID: String,
	projectName:String, 
	member:Boolean,
	});

module.exports = mongoose.model('Invite',ProjectSchema);
