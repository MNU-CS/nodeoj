var net=require('net');
var os=require('os');
var fs=require('fs');
var conf=require('./conf');
var async=require('async');
module.exports={
	__cache:{},
	
	/*
	 * status={
	 *	runid:xxx,
	 *	problem:xxx,
	 *	data:[1,2,4,6,7]
	 *}
	 */
	check:function(status,callback)
	{
		var noExists=[];
		var cacheDir=conf.cacheDir+status.problem+'/';
		var checkfuns=[];
		for(var i=0;i<status.data.length;i++)
		{
			(function(i){
				checkfuns.push(function(callback){
					fs.exists(cacheDir+status.data[i]+'.in',function(exists){callback(null,exists);});
				});
			})(i);
		}
		var that=this;
		async.parallel(checkfuns,function(err,exists){
			for(var i=0;i<exists.length;i++)
			{
				if(!exists[i])noExists.push(status.data[i]);
			}
			if(noExists.length)
			{
				that.__cache[status.runid]=status;
				callback(null,{
					action:'getdata',
					problem:status.problem,
					runid:status.runid,
					needData:noExists
				});
			}
			else
			{
				callback(null);
			}
		});
	},
	
	/*
	 * data={
	 *	runid:xxx,
	 *	data:[
	 *	  {
	 *		id:xxxx,
	 *		problem:xxxxx,
	 *      input:'input',
	 *		output:'output'
	 *	  }
	 * 	]
	 *}
	 */
	update:function(newdata,callback)
	{
		var writefuns=[];
		var that=this;
		var cacheDir=conf.cacheDir+newdata.problem+'/';
		fs.mkdir(cacheDir,function(){
			for(var i=0;i<newdata.data.length;i++)
			{
				(function(i){
					writefuns.push(function(callback){
						fs.writeFile(cacheDir+newdata.data[i].id+'.in',newdata.data[i].input,callback);
					});
					writefuns.push(function(callback){
						fs.writeFile(cacheDir+newdata.data[i].id+'.ans',newdata.data[i].output,callback);
					});
				})(i);
			}
			async.parallel(writefuns,function(){
				callback(that.__cache[newdata.runid]);
				delete that.__cache[newdata.runid];
			});
		});
	}
}