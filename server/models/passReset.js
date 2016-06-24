var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PassReset = new Schema ({
	createdAt: { type: Date, default: Date.now },
	userID:String, 
	email:String,
	});

module.exports = mongoose.model('PassReset',PassReset);
