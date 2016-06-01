var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comfirmSchema = new Schema ({
	createdAt: { type: Date, expires: '45m' },
	userID : String,
	});

module.exports = mongoose.model('emailConfirmation',comfirmSchema);
