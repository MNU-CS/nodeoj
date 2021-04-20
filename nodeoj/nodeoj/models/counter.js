var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
/*
 * 计数器模型
 * mongodb数据库不能自增，所以在需要自增ID的地方用这个玩意
 * Usage:
 * var Counter=require('./xxxxx/counter');
 * Counter.getnext(name,init,callback);
 * @parme name:唯一标识符
 * @parme init:初始值
 * @parme callback:回掉函数
 * WTF...写注释有吊用啊。。。我真是闲的蛋疼了
 * 就写这一个。。当娱乐了
*/
var schema=new Schema({
	name:String,
	count:Number
});
schema.statics.getnext=function(cname,init,callback)
{
	var Counter=this;
	var name="counter_"+cname;
	this.findOne({name:name},function(err,data){
	
		if(err)return callback(err);
		if(data)
		{
			Counter.collection.findAndModify(
				{name:name},
				[],
				{$inc:{count:1}},
				function(err,ndata){
					callback(null,ndata.value.count);
			});
		}else{
			init-=0;
			if(!init)init=0;
			Counter.create({name:name,count:init},function(err,d){
				Counter.getnext(cname,init,callback);
			});
		}
	});
};

module.exports=mongoose.model('counter', schema);

