var net = require('net');
var split=require('split');
var jkit=require('./jkit');
var jstatus=jkit.status;
var status=require('./models/status');
var problem=require('./models/problem');
var user=require('./models/user');
var judger=require('./models/judger');
var contest=require('./models/contest');
var conf=require('./conf');
var judgerStatus=[];
var judgers=[];
var async=require('async');
var heap=require('heap');
function Heap()
{
	return new heap(function(a,b){
		return a.data.id-b.data.id;
	});
}
exports.init=function()
{
	judger.find(function(err,data){
		if(err)return console.error('judger init error!', err);
		judgers=data;
		for(var i=0;i<data.length;i++)
		{
			var a=data[i].addr.indexOf(':');
			judgers[i].addrx={
				host:data[i].addr.substr(0,a++),
				port:data[i].addr.substr(a)
			};
		}
		checkJudger();
	});
}
exports.init();
function checkJudger()
{
	var tmpJudgers=[];
	var checkcount=0;
	for(var i=0;i<judgers.length;i++)
	{
		(function(i){
			judgers[i].status='offline';
			var client=net.connect(judgers[i].addrx,function(err){
				if(err)return;
				checkcount++;
				jkit.writeJson(client,{action:'getstatus'});
			});
			client.on('error',function(err){
				console.error('Socket error:', err);
			});
			var stream=client.pipe(split());
			stream.on('data',function(data){
				if(!data)return;
				data=JSON.parse(data);
				judgers[i].status='online';
				judgers[i].queue=data.queue;
				tmpJudgers.push(judgers[i]);
				checkcount--;
				if(!checkcount)
				{
					judgerStatus=tmpJudgers;
					
					//继续，更新评测机状态
					var online=[],offline=[];
					for(var x=0;x<judgers.length;x++)
					{
						var query=judgers[x].name;
						judgers[x].status=='online'?online.push(query):offline.push(query);
					}
					judger.update({name:{$in:online}},{status:'online'}).exec();
					judger.update({name:{$in:offline}},{status:'offline'}).exec();
					if (offline.length > 0)
						console.warn('Judger offline:', offline);
				}
			});
		})(i);
	}
}

function judgebase(data,rejudge,probind,ondata)
{
	problem.get(data.problem,function(err,p){
		if(!p)return;
		if(!p.data.length||!judgerStatus.length)return data.update({status:'System Error'}).exec();
		var testdata=[];

		for(var i=0;i<p.data.length;i++)
		{
			testdata.push(p.data[i].id);
			probind[p.data[i].id]=i;
		}
		var judgeData={
			runid:data.id,
			problem:data.problem,
			timeLimit:p.timeLimit,
			memoryLimit:p.memoryLimit,
			code:data.code,
			language:data.language,
			data:testdata,
			score:0,
			contest:data.contest?data.contest:''
		};
		var minqueue=0;
		for(var i=0;i<judgerStatus.length-1;i++)
		{
			if(judgerStatus[i+1].queue<judgerStatus[minqueue].queue)minqueue=i+1;
			if(!judgerStatus[minqueue].queue)break;
		}
		judgerStatus[minqueue].update({$inc:{submission:1}}).exec();

		var client=net.connect(judgerStatus[minqueue].addrx,function(err){
			jkit.writeJson(client,judgeData);
		});
		var stream=client.pipe(split());
		stream.on('data',function(cdata){
			if(!cdata)return;
			cdata=JSON.parse(cdata);
			var score=0;
			if(cdata.status!=jstatus.CE&&(function(){for(var x in jstatus)if(jstatus[x]==cdata.status)return true;return false;})())
			{
				for(var i=0;i<cdata.test.length;i++)
					if(cdata.test[i].status==jstatus.AC)
						score++;
				cdata.score=parseInt(score*100/cdata.test.length);				
			}

			if(cdata.action!='getdata')return ondata(cdata,p,client);

			var getfun=[];
			for(var i=0;i<cdata.needData.length;i++)
			{
				getfun.push((function(i){
					return function(callback){
						problem.getData(p.id,p.data[probind[cdata.needData[i]]].id,callback);
					};
				})(i));
			}
			async.parallel(getfun,function(err,result){
				cdata.data=result;
				cdata.action='newdata';
				console.log('send new data');
				jkit.writeJson(client,cdata);
			});
		});
		client.on('error',function(err){
			console.log(err);
		});
	});
}
exports.judge=function(data,rejudge)
{
	var probind={};
	var updatesubmission=false;
	judgebase(data,rejudge,probind,function(cdata,p,client){
		if(!rejudge&&!updatesubmission)
		{
			p.update({$inc:{submissions:1}}).exec();
			updatesubmission=true;
		}
		if(cdata.action=='status')
		{
			delete cdata.action;
			console.log('update new status:');
			data.update(cdata).exec();
			if((function(){for(var x in jstatus)if(jstatus[x]==cdata.status)return true;return false;})())
			{
				var incs=0;
				if(cdata.status==jstatus.AC&&data.status!=jstatus.AC)
					incs=1;
				else if(cdata.status!=jstatus.AC&&data.status==jstatus.AC)
					incs=-1;
				if(incs)p.update({$inc:{accepted:incs}}).exec();
				user.get(data.user,function(err,usr){
					if(usr.submitted[p.id]!=jstatus.AC||rejudge)
					{
						var incs=0;
						if(cdata.status==jstatus.AC&&usr.submitted[p.id]!=jstatus.AC)
							incs=1;
						else if(cdata.status!=jstatus.AC&&usr.submitted[p.id]==jstatus.AC)
							incs=-1;
						if(incs)usr.update({$inc:{accepted:incs}}).exec();
						var upd={$set:{}};
						upd["$set"]["submitted."+p.id]=cdata.status;
						usr.update(upd).exec();
					}
				});
			}
		}
	});
};
var contestqueue={};
exports.contestjudge=function(c,data,rejudge)
{
	if(!(c.id in contestqueue))contestqueue[c.id]={};
	if(!(data.user in contestqueue[c.id]))contestqueue[c.id][data.user]=Heap();
	var cq=contestqueue[c.id][data.user];
	cq.judging=false;
	var cp=data.problem;
	
	if(!rejudge)
	{
		var sets={};
		sets['sscount.'+cp+'.submit']=1;
		c.update({$inc:sets}).exec();
	}
	
	data.problem=c.maprob[data.problem];
	data.contest="C"+c.id+"_";
	var probind={};
	judgebase(data,rejudge,probind,function(cdata,p,client){
		if(cdata.action=='status')
		{
			delete cdata.action;
			data.update(cdata).exec();
			if((function(){for(var x in jstatus)if(jstatus[x]==cdata.status)return false;return true;})())return;
			cq.push({
				cid:c.id,
				data:data,
				rejudge:rejudge,
				cdata:cdata,
				p:p,
				client:client,
				cp:cp
			});
			if(cq.judging)return;
			cq.judging=true;
			while(cq.size())
			{
				var qdata=cq.pop();
				var cid=qdata.cid;
				data=qdata.data;
				rejudge=qdata.rejudge;
				cdata=qdata.cdata;
				p=qdata.p;
				client=qdata.client;
				cp=qdata.cp;
				console.log('judging.contest:%d,user:%s,runid:%d,queue.size:%d\n',c.id,data.user,data.id,cq.size());
				contest.get(cid,function(err,c){
					
					if(!c.contestant[data.user][cp])c.contestant[data.user][cp]={cnt:0,time:Number.MAX_VALUE};
					//console.log(c.contestant[data.user][cp]);
					var sets={};
					var incs={};
					var bits={};
					var 
						failcnt=c.contestant[data.user][cp].cnt^-1, //失败次数
						actime=data.date-c.begin, //AC直接用时
						penalty=actime+failcnt*20*60*1000;//罚时=直接用时+失败次数*20分钟
					if(rejudge)
					{
						console.log("rejudge %d,%sAC->%s",cdata.id,c.contestant[data.user][cp].cnt<0?'UN':'',cdata.status);
						//重测AC,之前没AC
						if(cdata.status==jstatus.AC&&c.contestant[data.user][cp].cnt<0)
						{
							sets['contestant.'+data.user+'.'+cp+'.time']=actime; //AC用时
							sets['contestant.'+data.user+'.'+cp+'.penalty']=penalty; //该题罚时
							incs['contestant.'+data.user+'.solved']=1; //用户总解题数
							incs['contestant.'+data.user+'.penalty']=penalty; //用户总罚时
							incs['sscount.'+cp+'.solved']=1; //比赛该题解出数量
							incs['sscount.'+cp+'.cnt']=failcnt; //该题失败数量
							sets['contestant.'+data.user+'.'+cp+'.score']=cdata.score;
						}else if(cdata.status!=jstatus.AC&&c.contestant[data.user][cp].cnt>=0)
						{
							sets['contestant.'+data.user+'.'+cp+'.time']=Number.MAX_VALUE;
							incs['contestant.'+data.user+'.penalty']=-c.contestant[data.user][cp].penalty;
							incs['contestant.'+data.user+'.solved']=-1;
							incs['sscount.'+cp+'.solved']=-1;
							incs['sscount.'+cp+'.cnt']=-c.contestant[data.user][cp].cnt;
							if(cdata.status!=jstatus.CE)sets['contestant.'+data.user+'.'+cp+'.score']=cdata.score;
						}
						else return;//没有任何改变,跳出
						bits['contestant.'+data.user+'.'+cp+'.cnt']={xor:-1}; //改变状态
						return c.update({$set:sets,$inc:incs,$bit:bits}).exec();
					}
					//如果已经AC就跳出
					if(!c.rule&&c.contestant[data.user][cp].cnt>=0&&c.contestant[data.user][cp].time!==Number.MAX_VALUE)return;
					if(cdata.status==jstatus.AC)
					{
						failcnt++; //补上提交数
						penalty+=20*60*1000; //补上提交次数导致的罚时
						sets['contestant.'+data.user+'.'+cp+'.cnt']=failcnt; //改变状态
						sets['contestant.'+data.user+'.'+cp+'.time']=actime; //用时
						sets['contestant.'+data.user+'.'+cp+'.penalty']=penalty; //该题罚时
						sets['contestant.'+data.user+'.'+cp+'.score']=cdata.score;
						incs['contestant.'+data.user+'.solved']=1;
						incs['contestant.'+data.user+'.penalty']=penalty;
						incs['sscount.'+cp+'.solved']=1;
						incs['sscount.'+cp+'.cnt']=failcnt;
					}else if(cdata.status in jkit.fstatus)
					{
						//失败的话,累加失败次数
						incs['contestant.'+data.user+'.'+cp+'.cnt']=-1;
						if(cdata.status!=jstatus.CE)sets['contestant.'+data.user+'.'+cp+'.score']=cdata.score;
						return c.update({$set:sets,$inc:incs}).exec();
					}
					else return;
					c.update({$set:sets,$inc:incs}).exec();
				});
			}
			cq.judging=false;
		}
	});
};
setInterval(checkJudger,conf.checkJudgerInterval);
