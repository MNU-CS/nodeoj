var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Counter=require('./counter');

var schema=new Schema({
	id:{type:Number,index: { unique: true, dropDups: true }},
	user:String,
	problem:String,
	status:{type:String,default:'Waiting'},
	test:{type:Array,default:[]},
	compileInfo:String,
	time:{type:Number,default:0},
	memory:{type:Number,default:0},
	language:String,
	code:String,
	date:{type:Date,default:Date.now}
});

schema.statics.get=function(id,callback)
{
	this.findOne({id:id},callback);
};
schema.statics.add=function(data,callback,counter)
{
	var that=this;
	if(!counter)counter="status";
	Counter.getnext(counter,1,function(err,id){
		data.id=id;
		that.create(data,callback);
	});
};
schema.statics.getlist=function(filter,page,limits,callback)
{
	this.find(filter).skip((page-1)*limits).limit(limits).sort({id:-1}).find(callback);
};
module.exports = mongoose.model('status', schema);