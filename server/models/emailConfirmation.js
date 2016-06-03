var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comfirmSchema = new Schema ({
	create_date: {type:Date, default:Date.now},
	userID : String,
	email : String,
	});

module.exports = mongoose.model('emailConfirmation',comfirmSchema);
