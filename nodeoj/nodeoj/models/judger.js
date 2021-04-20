var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var schema=new Schema({
	name:{type:String,index: { unique: true, dropDups: true }},
	addr:String,
	status:{type:String,default:'offline'},
	submission:{type:Number,default:0}
});
schema.statics.getlist=function(callback)
{
	
};
module.exports=mongoose.model('judger', schema);

