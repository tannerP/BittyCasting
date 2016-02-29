//Load Packages
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//user Schema by mongoose
var UserSchema = new Schema({
	last_name : {
		type:String,
		require: true, 
	},
	first_name : {
		type:String,
		require: true, 
	},
	password: {
		type:String, 
		required:true, 
		select:true
	},
	email:{
		type:String,
		require:true,
		index:{	unique:true	}
	},
});

//hash the password before the user is saved
UserSchema.pre('save',function(next){
	var user = this;

	//hash the password only if the password has been 
	//changed or user is new

	if(!user.isModified('password')) return next();

	//generate the hash
	bcrypt.hash(user.password, null, null, function(err, hash){
		if(err) return next(err);

		//change the password to the hashed version
		user.password = hash;
		next();
	});
});

//method to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password){
	var user = this;

	return bcrypt.compareSync(password,user.password);
};

//return the model
module.exports = mongoose.model('User',UserSchema);