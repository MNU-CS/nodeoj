var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var problem = require('./../models/problem');
var contest = require('./../models/contest');
var status=require('./../models/status');
var discuss=require('./../models/discuss');
var judge=require('./../judge').contestjudge;
var async=require('async');
var toolkit=require('./../toolkit');

router.all(/^\/(\d+)\/?(.*)\/?$/,function(req,res,next){
	var id=req.params[0];
	if(req.body.password)
	{
		toolkit.setcookie(res,'contest_'+id+'_password',req.body.password);
		res.redirect('/C/'+id);
	}
	contest.get(id,function(err,c){
		if(err)return res.Error(err);
		if(!c)return res.redirect('/contest');
		c.problem.sort(function(a,b){
			return a.id>b.id?1:-1;
		});
		if(c.password&&req.cookies['contest_'+id+'_password']!=c.password)return res.render('contest_password', {
			activeLink:'#contest',
			contest:c,
		  });
		res.locals.contest=c;
		if(c.begin>new Date&&req.params[1]!='register'&&req.params[1].substr(0,4).toLowerCase()!='rank')return res.render('contest', {activeLink:'#contest,#c_overview'});
		next();
	});
});

router.get(/^\/(\d+)\/status\/?(\d*)\/?$/i, function(req, res) {
	var id=req.params[0];
	var page=req.params[1];
	if(page<1)page=1;
	var c=res.locals.contest;
	var cstatus=mongoose.model('contest_'+id+'_status', status.schema);
	var filter={};
	var filterItem=['problem','status','language'];
	if(c.rule&&!res.locals.isadmin&&c.end>new Date)delete filterItem[1];
	for(var i=0;i<filterItem.length;i++)
		if(req.query[filterItem[i]])
			filter[filterItem[i]]=req.query[filterItem[i]];
	
	if(c.rule&&!res.locals.isadmin&&c.end>new Date)req.query.user=res.locals.userinfo?res.locals.userinfo.username:'Please Login';
	if(req.query.user)filter.user={$regex:new RegExp("^"+req.query.user.toRegexStr()+"$",'i')}
	
	async.parallel([
		function(callback){cstatus.getlist(filter,page,20,callback);},
		function(callback){cstatus.count(filter,callback);}
	],
	function(err,results){
		if(err)return res.Error(err);
		res.render('contest_status', {
				activeLink:'#contest,#c_status',
				pageName:'C/'+id+'/status',
				contest:c,
				status :results[0],
				maxPage:Math.ceil(results[1]/20),
				curPage:parseInt(page)
			  });
	});
});
router.get('/:id/status/detail/:runid',function(req,res){
	var c=res.locals.contest;
	var cstatus=mongoose.model('contest_'+req.params.id+'_status', status.schema);
	cstatus.get(req.params.runid,function(err,data){
	  res.render('contest_status_detail', {
		activeLink:'#contest,#c_status',
		status :data
	  });
	});
});
router.post('/:id/status/detail/:runid/rejudge',function(req,res){
	if(res.locals.isadmin)
	{
		var c=res.locals.contest;
		var cstatus=mongoose.model('contest_'+req.params.id+'_status', status.schema);
		cstatus.get(req.params.runid,function(err,data){
		  judge(c,data,true);
		});
	}
	res.end();
});
router.get('/:id', function(req, res) {
	var c=res.locals.contest;
	res.render('contest', {
		activeLink:'#contest,#c_overview'
	});
});

router.get('/:id/register', function(req, res){
	if(!res.checklogin())return;
	var c=res.locals.contest;
	var username=res.locals.userinfo.username;
	if(!c.contestant[username])c.register(username,function(){
		res.redirect('/C/'+c.id);
	});
});
router.get(/^\/(\d+)\/P\/?(.*)$/i, function(req, res) {
	var id=req.params[0];
	var pid=req.params[1];
	var c=res.locals.contest;
	if(!c.problem[0])return res.Error(null,'无法找到题目：'+id);
	if(!c.maprob[pid])return res.redirect('/C/'+id+'/P/'+c.problem[0].id);
	
	problem.get(c.maprob[pid],function(err,p){
		p.submissions=c.sscount[pid].submit;
		p.accepted=c.sscount[pid].solved;
		res.render('contest_problem', {
			activeLink:'#contest,#c_problem,#p_'+pid,
			p:p,
			pid:pid
		});
	});
});
router.get('/:id/rank', function(req, res) {
	//if(!res.checklogin())return;
	var c=res.locals.contest;
	if(c.rule&&new Date<c.end&&!res.locals.isadmin)res.redirect('/C/'+req.params.id);
	var list=[];
	for(var i=0;i<c.clist.length;i++)list.push(c.contestant[c.clist[i]]);
	if(!c.rule)
	list.sort(function(a,b){
		if(a.solved>b.solved)return -1;
		if(a.solved<b.solved)return 1;
		return a.penalty-b.penalty;
	});
	var renderpage=req.query.roll?'contest_rollrank':'contest_rank';
	res.render(renderpage, {
		activeLink:'#contest,#c_rank',
		rank:list,
		contestant:c.contestant
	});
});

router.post('/:id/P/:pid/submit', function(req, res) {
	if(!res.checklogin())return;
	var c=res.locals.contest;
	var callee=arguments.callee;
	if(new Date>c.end)return res.Error(null,'比赛已经结束');
	if(new Date<c.begin)return res.Error(null,'比赛还未开始');
	if(!c.contestant[res.locals.userinfo.username])
		return c.register(res.locals.userinfo.username,function(err){
			if(err)return res.Error(null,"没有注册该比赛");
			contest.get(c.id,function(err,nc){
				res.locals.contest=nc;
				callee(req, res);
			});
		});//return res.send('please register first');
	
	req.body.user=res.locals.userinfo.username;
	req.body.problem=req.params.pid;
	var cstatus=mongoose.model('contest_'+req.params.id+'_status', status.schema);
	cstatus.add(req.body,function(err,data){
		if(err)return res.Error(err,"提交失败");
		//res.locals.userinfo.update({$inc:{submissions:1}}).exec();
		judge(c,data);
		res.redirect('/C/'+req.params.id+'/status');
	},'contest_'+req.params.id+'_status');
});

router.post(/^\/(\d+)\/discuss.*/i,function(req,res,next){
	if(res.locals.contest.rule&&new Date<res.locals.contest.end&&!res.locals.isadmin)res.redirect('/C/'+req.params[0]);
	if(!res.locals.userinfo)return res.Error(null,'请先登录');
	req.body.author=res.locals.userinfo.username;
	next();
});
router.get(/^\/(\d+)\/discuss\/?(?:P\/(.*?)\/?)?(\d*)\/?$/i, function(req, res) {
	var cid=req.params[0];
	if(res.locals.contest.rule&&new Date<res.locals.contest.end&&!res.locals.isadmin)res.redirect('/C/'+cid);
	var cdiscuss=mongoose.model('contest_'+cid+'_discuss', discuss.schema);

	if(req.params.length==2)
	{
		var page=req.params[1];
		var shit={};
	}
	else
	{
		var problem=req.params[1]
		var page=req.params[2];
		var shit={problem:problem};
	}
	if(page<1)page=1;

	async.parallel([
		function(callback){cdiscuss.getlist(page,20,callback,problem);},
		function(callback){cdiscuss.count(shit,callback);}
	],
	function(err,results){
		res.render('contest_discuss', {
				activeLink:'#contest,#c_discuss',
				pageName:'discuss',
				topics :results[0],
				maxPage:Math.ceil(results[1]/20),
				curPage:parseInt(page)
			  });
	});
});
router.post(/^\/(\d+)\/discuss\/?(?:(?:P\/(.*?))?\/?)$/i,function(req,res){
	var cid=req.params[0];
	if(res.locals.contest.rule&&new Date<res.locals.contest.end&&!res.locals.isadmin)res.redirect('/C/'+cid);
	var cdiscuss=mongoose.model('contest_'+cid+'_discuss', discuss.schema);

	var problem=req.params[1];
	if(problem)req.body.problem=problem;
	cdiscuss.add(req.body,function(err,c){
		if(!err)return res.redirect('/C/'+cid+'/discuss/'+c._id);
		return res.Error(err,'请求失败');
	});
});
router.get(/^\/(\d+)\/discuss\/?([0-9a-fA-F]{24})\/?$/i,function(req,res){
	var cid=req.params[0];
	if(res.locals.contest.rule&&new Date<res.locals.contest.end&&!res.locals.isadmin)res.redirect('/C/'+cid);
	var cdiscuss=mongoose.model('contest_'+cid+'_discuss', discuss.schema);

	var id=req.params[1];
	cdiscuss.update({_id:id},{$inc:{view:1}}).exec();
	cdiscuss.get(id,function(err,post){
		if(err||!post)return res.Error(err,"无法找到话题："+id);
		res.render('contest_discuss_post', {
			activeLink:'#contest,#c_discuss',
			post:post
		});
	});
});
router.post(/^\/(\d+)\/discuss\/?([0-9a-fA-F]{24})\/?$/i,function(req,res){
	var cid=req.params[0];
	if(res.locals.contest.rule&&new Date<res.locals.contest.end&&!res.locals.isadmin)res.redirect('/C/'+cid);
	var cdiscuss=mongoose.model('contest_'+cid+'_discuss', discuss.schema);
	var id=req.params[1];
	cdiscuss.update({_id:id},{$push:{replay:req.body}}).exec();
	res.redirect('back');
});
module.exports = router;
