var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var schema=new Schema({
	title:String,
	content:String,
	author:String,
	replay:[{
		content:String,
		author:String,
		date:{type:Date,default:Date.now}
	}],
	view:{type:Number,default:0},
	stick:{type:Boolean,default:false},
	problem:{type:String,default:''},
	date:{type:Date,default:Date.now}
});

schema.statics.get=function(id,callback)
{
	this.findOne({_id:id},callback);
};
schema.statics.add=function(data,callback)
{
	if(!data.title)
	{
		data.title=data.content.substr(0,10);
		if(data.content.length>10)data.title+='...';
	}
	this.create(data,callback);
};
schema.statics.getlist=function(page,limits,callback,problem)
{
	this.find(problem?{problem:problem}:{}).skip((page-1)*limits).limit(limits).sort({stick:-1,_id:-1}).find(callback);
};
module.exports = mongoose.model('discuss', schema);