var mongoose = require('mongoose');
var tookit=require('./../toolkit');
var Schema   = mongoose.Schema;

var schema=new Schema({
	lowername:{type:String,index: { unique: true, dropDups: true }},
	username:String,
	password:String,
	email:String,
	userGroup:{type:Number,default:0},
	motto:{type:String,default:''},
	submissions:{type:Number,default:0},
	submitted:{type:Schema.Types.Mixed,default:{}},
	accepted:{type:Number,default:0},
	lastLogin:{type:Date,default:Date.now},
	regDate:{type:Date,default:Date.now}
});

schema.statics.get=function(username,callback)
{
	this.findOne({lowername:username.toLowerCase()},callback);
};
schema.statics.add=function(data,callback)
{
	var that=this;
	data.lowername=data.username.toLowerCase();
	this.findOne({lowername:data.lowername},function(err,usr){
		if(err)return callback("数据库内部错误");
		if(usr)return callback("用户名已经存在");
		that.create(data,callback);
	});
};
schema.statics.ranklist=function(page,limits,callback)
{
	this.find(
		{submissions:{$gt:0}},
		{
			username:true,
			motto:true,
			accepted:true,
			submissions:true
		}
	).sort({accepted:-1,submissions:1}).skip((page-1)*limits).limit(limits).find(callback);
};
schema.statics.getlist=function(page,limits,callback)
{
	this.find().skip((page-1)*limits).limit(limits).find(callback);
};
schema.statics.login=function(res,username,password,callback)
{
	if(username&&password)
	{
		this.findOne({lowername:username.toLowerCase(),password:password},function(err,user){
			if(err)return callback(err);
			if(user)
			{
				user.update({lastLogin:new Date});
				user.setcookie(res);
			}
			callback(null,user);
		});
	}
	else
	{
		callback(null,null);
	}
};
schema.statics.autologin=function(req,res,callback)
{
	var username=req.cookies.username;
	var password=req.cookies.password;
	this.login(res,username,password,callback);
};
schema.statics.setcookie=function(res,username,password)
{
	tookit.setcookie(res,'username',username);
	tookit.setcookie(res,'password',password);
};
schema.methods.setcookie=function(res)
{
	this.constructor.setcookie(res,this.username,this.password);
};
module.exports = mongoose.model('user', schema);