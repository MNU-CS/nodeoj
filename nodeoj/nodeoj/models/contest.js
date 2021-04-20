var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Counter=require('./counter');

var schema=new Schema({
	id:{type:Number,index: { unique: true, dropDups: true }},
	title:String,
	description:String,
	begin:Date,
	end:Date,
	regBegin:Date,
	regEnd:Date,
	password:String,
	rule:Number,
	manager:String,
	problem:{type:Array,default:[]},
	maprob:{type:Object,default:{}},
	sscount:{type:Object,default:{}},
	contestant:{type:Object,default:{length:0}},
	clist:{type:Array,default:[]},
	date:{type:Date,default:Date.now}
});

schema.statics.get=function(id,callback)
{
	this.findOne({id:id},callback);
};
schema.statics.add=function(data,callback)
{
	var that=this;
	Counter.getnext("contest",1,function(err,id){
		data.id=id;
		that.create(data,callback);
	});
};
schema.methods.register=function(username,callback)
{
	if(new Date>this.regEnd)return callback('Register Ended!');
	var sets={};
	sets['contestant.'+username]={
		user:username,
		penalty:0,
		solved:0,
		cnt:0
	};
	this.update({$set:sets,$inc:{'contestant.length':1},$push:{'clist':username}}).exec(callback);
};
function getCdt(search)
{
	return search?{title:{$regex:search}}:{};
}
schema.statics.Count=function(callback,search)
{
	this.count(getCdt(search),callback);
};
schema.statics.getlist=function(page,limits,callback,search)
{
	this.find(getCdt(search)).skip((page-1)*limits).limit(limits).sort({id:-1}).find(callback);
};
module.exports = mongoose.model('contest', schema);