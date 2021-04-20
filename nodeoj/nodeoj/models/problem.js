var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Counter=require('./counter');
var async=require('async');
var conf=require('./../conf');
var fs=require('fs');
var schema=new Schema({
	id:{type:Number,index: { unique: true, dropDups: true }},
	title:String,
	description:String,
	input:String,
	output:String,
	sampleInput:String,
	sampleOutput:String,
	hint:String,
	source:String,
	timeLimit:Number,
	memoryLimit:Number,
	submissions:{type:Number,default:0},
	accepted:{type:Number,default:0},
	hidden:{type:Boolean,default:false},
	owner:String,
	data:{type:Array,default:[]},
	date:{type:Date,default:Date.now}
});

schema.statics.addData=function(pid,data,callback)
{
	var that=this;
	Counter.getnext("problem_data_"+pid,1,function(err,id){
		data.id=id;
		var path=conf.dataDir+pid+'/'+id;
		async.parallel([
			function(callback){
				that.update({id:pid},{$push:{data:{id:id,length:data.input.length+data.output.length}}},callback);
			},
			function(callback){
				fs.writeFile(path+'.in',data.input,callback);
			},
			function(callback){
				fs.writeFile(path+'.out',data.output,callback);
			}],
			callback);
	});
};
schema.statics.getData=function(pid,id,callback){
	var path=conf.dataDir+pid+'/'+id;
		async.parallel([
			function(callback){
				fs.readFile(path+'.in',callback);
			},
			function(callback){
				fs.readFile(path+'.out',callback);
			}],
			function(err,result){
				if(err)return callback(err);
				callback(null,{id:id,input:result[0].toString(),output:result[1].toString()});
			});
};
schema.statics.delData=function(pid,id,callback)
{
	var path=conf.dataDir+pid+'/'+id;
	var that=this;
	async.parallel([
		function(callback){
			that.update({id:pid},{$pull:{data:{id:id}}},callback);
		},
		function(callback){
			fs.unlink(path+'.in',callback);
		},
		function(callback){
			fs.unlink(path+'.out',callback);
		}],callback);
};
schema.statics.get=function(id,callback)
{
	this.findOne({id:id},callback);
};
schema.statics.del=function(pid,callback)
{
	this.get(pid,function(err,p){
		var dels=[];
		var data=p.data;
		var path=conf.dataDir+pid+'/';
		for(var i=0;i<data.length;i++)
		{
			dels.push((function(i){
				return function(cb){
					fs.unlink(path+data[i].id+'.in',cb);
				};
			})(i));
			dels.push((function(i){
				return function(cb){
					fs.unlink(path+data[i].id+'.out',cb);
				};
			})(i));
		}
		asyn.parallel(dels,function(err){
			fs.rmdir(path);
		});
		problem.remove({id:req.params.pid},function(err,p){
			res.redirect('/admin/problem');
		});
	});
};
schema.statics.add=function(data,callback)
{
	var that=this;
	Counter.getnext("problem",1000,function(err,id){
		data.id=id;
		async.parallel(
			[function(cb){
				that.create(data,cb);
			}, function(cb){
				fs.mkdir(conf.dataDir+id,function(){cb(null)});
			}],
			function(err,result){
				if(err)console.log(err);
				callback(err,result[0]);
			}
		);
	});
};
function getCdt(isAdmin,search)
{
	var cdt={};
	if(!isAdmin)cdt.hidden=false;
	if(search)cdt.title={$regex:search}
	return cdt;
}
schema.statics.Count=function(callback,isAdmin,search)
{
	this.count(getCdt(isAdmin,search),callback);
};
schema.statics.getlist=function(page,limits,callback,isAdmin,search)
{
	this.find(
	getCdt(isAdmin,search),
	{data:false}
	).skip((page-1)*limits).limit(limits).sort({id:-1}).find(callback);
};
module.exports = mongoose.model('problem', schema);