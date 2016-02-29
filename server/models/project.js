var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	user : String, 
	user_id : String, 

	name : {
		type: String, 
		require : true,
		index: {unique:true}
	},
	details: String,

	roles: [{role_name:{type:String,required:true},
					description:{type:String, require:true},
					end_date:{type:Date, required:false},
					end_time:{type:String, require:false},
					updated_date:{type:Date, default:Date.now},
					location:{type:String, require:false},
					paid:{type:String},
					age_min: {type:Number, min:18, max:65},
					sex:{type:String},
					requirements:[{
						name:String,
						required:Boolean
					}]

				}]
});
module.exports = mongoose.model('Project',ProjectSchema);