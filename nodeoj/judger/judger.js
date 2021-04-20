var net=require('net');
var os=require('os');
var fs=require('fs');
var jkit=require('./jkit');
var jstatus=jkit.status;
var split=require('split');
var conf=require('./conf');
var cache=require('./cache');
var compile=require('./compile');
var exec = require('child_process').exec;
var async=require('async');
var JudgerFile='..\\..\\Judger';

function getRunDir(status)
{
	return conf.runDir+status.contest+status.runid+'/';
}
function LanguageCommand(file, correct) {
	this.exeFile = file;
	this.memCorrect = correct;
}
function preJudge(status)
{
	var JudgeCommand={
		"C": new LanguageCommand('main', 380),
		"C++": new LanguageCommand('main', 380),
		"Java": new LanguageCommand('java -DONLINE_JUDGE=true Main', 	244100),
		'Python2.7': new LanguageCommand('python source.py', 4250)
	};
	var cmds=[];
	var cpFunc=[];
	var dataDir=conf.cacheDir+status.problem+'/';
	var runDir=getRunDir(status);
	for(var i=0;i<status.data.length;i++)
	{
		cmds.push(JudgerFile+' "'+JudgeCommand[status.language].exeFile+'" '+status.data[i]+'.in '+
				status.data[i]+'.out '+
				status.data[i]+'.ans '+
				status.timeLimit+' '+status.memoryLimit+' '+JudgeCommand[status.language].memCorrect
		);
		fs.createReadStream(dataDir+status.data[i]+'.in').pipe(fs.createWriteStream(runDir+status.data[i]+'.in'));
		fs.createReadStream(dataDir+status.data[i]+'.ans').pipe(fs.createWriteStream(runDir+status.data[i]+'.ans'));
	}
	return cmds;
}

function retStatus(socket,status,info,end)
{
	var s={action:'status',status:status};
	if(info===true)return jkit.endJson(socket,s);
	if(info!=undefined)s.compileInfo=info;

	if(end)
		jkit.endJson(socket,s);
	else
		jkit.writeJson(socket,s);
}
function Log(data,s)
{
	console.log(data.runid+':'+s);
}
function Judge(socket,data)
{
	if(processnum>=maxprocess)
	{
		queue.push({socket:socket,data:data});
		retStatus(socket,'Queuing');
		Log(data,'Queuing');
		return;
	}
	Log(data,'Start Judge');
	processnum++;
	retStatus(socket,'Compiling');
	Log(data,'Compiling');
	var tryjudge=function()
	{
		processnum--;
		if(processnum<maxprocess&&queue.length)
		{
			var newStatus=queue.shift();
			Judge(newStatus.socket,newStatus.data);
		}
	}
	compile(data,function(err,info){
		if(err)
		{
			retStatus(socket,'Compile Error',info,true);
			Log(data,'Compile Error');
			return tryjudge();
		}
		retStatus(socket,'Running','');
		Log(data,'Running');
		var cmds=preJudge(data);
		var subStatus=[];
		var runFunc=[];
		var runDir=getRunDir(data);
		for(var i=0;i<cmds.length;i++)
		{
			(function(i){
				console.log("cmd is", cmds[i], runDir);
				runFunc.push(function(callback){
					exec(cmds[i],{
						cwd:runDir
					},callback);
				});
			})(i);
		}
		async.series(runFunc,function(err,results){
			var ac=true,pe=true,wa=false,mle=false,re=false,tle=false;
			var maxTime=0,maxMemory=0;
			for(var i=0;i<results.length;i++)
			{
				var subs=JSON.parse(results[i][0]);
				subs.id=data.data[i];
				if(subs.time>maxTime)maxTime=subs.time;
				if(subs.memory>maxMemory)maxMemory=subs.memory;
				subStatus.push(subs);
				if(subs.status!=jstatus.AC)
				{
					ac=false;
					if(subs.status!=jstatus.PE)
					{
						pe=false;
						wa=wa||subs.status==jstatus.WA;
						mle=mle||subs.status==jstatus.MLE;
						tle=tle||subs.status==jstatus.TLE;
						re=re||subs.status==jstatus.RE;
					}
				}
			}
			var finalStatus={
				action:'status',
				status:ac?jstatus.AC
					  :pe?jstatus.PE
					  :tle?jstatus.TLE
					  :mle?jstatus.MLE
					  :re?jstatus.RE
					  :wa?jstatus.WA
					  :jstatus.OLE,
				time:maxTime,
				memory:maxMemory,
				test:subStatus
			}
			fs.readdir(runDir, function(err, files) {
				if (err) {
					console.error('Unable to read run directory', runDir, err);
					return;
				}
				for (var file of files) if (file.match(/\.((in)|(out)|(ans)|(exe)|(class))$/)) {
					fs.unlink(runDir + file, function(err) {
						if (err)
							console.error('Can not delete file', file, 'in', runDir, err);
					});
				}
			});
			jkit.endJson(socket,finalStatus);
			Log(data,finalStatus.status);
			tryjudge();
		});

	});
}
var queue=[];
var maxprocess=os.cpus().length;
var processnum=0;
var server=net.createServer(function(socket){
	var stream = socket.pipe(split());
	stream.on('data',function(data){
		if(!data)return;
		data=JSON.parse(data.toString());
		
		if(data.action=='getstatus')return jkit.endJson(socket,{queue:queue.length});
		if(data.action!='newdata')
		{
			cache.check(data,function(err,needData){
				if(needData)
				{
					console.log('require new data');
					jkit.writeJson(socket,needData);
					return;
				}
				Judge(socket,data);
			});
		}
		else
		{
			console.log('recived new data,updating');
			data=cache.update(data,function(jdata){
				Judge(socket,jdata);
			});
		}
		//Judge(socket,data);
	});
	socket.on('end',function(){
		console.log('connect closed');
	});
	socket.on('error',function(err){
		console.error('Socket error:', err);
	});
});
server.listen(888);