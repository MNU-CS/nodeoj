var express = require('express');
var bodyParser=require('body-parser');
var router = express.Router();
var problem=require('./../models/problem');
var user=require('./../models/user');
var counter=require('./../models/counter');
var contest=require('./../models/contest');
var judger=require('./../models/judger');
var judge=require('./../judge');
var discuss=require('./../models/discuss');
var async=require('async');
var mongoose=require('mongoose');
var discuss=require('./../models/discuss');
var similary=require('../similary');
var status=require('./../models/status');
router.all(/.*/,function(req,res,next){
	if(res.checklogin('admin_panel'))next();
});
router.get('/', function(req, res) {
  res.render('admin');
});
router.get('/problem', function(req, res) {
  res.render('admin_problem', {
		p:{
			id:0,
			title:'',
			timeLimit:1000,
			memoryLimit:65535,
			description:'',
			input:'',
			output:'',
			sampleInput:'',
			sampleOutput:'',
			hint:'',
			hidden:false,
			source:''
		}
  });
});
router.get('/contest', function(req, res) {
  res.render('admin_contest', {
		contest:{
			id:0,
			title:'',
			begin:new Date,
			end:new Date,
			password:'',
			manager:'',
			regBegin:new Date,
			regEnd:new Date,
			description:''
		}
  });
});

router.post('/problem',function(req,res){
	req.body.owner=res.locals.userinfo.lowername;
	problem.add(req.body,function(err,p){
		if(err)
			res.send("add failed");
		else
		res.redirect('/admin/problem/'+p.id);
	});
});
router.post('/contest',function(req,res){
	if(!req.body.manager)req.body.manager=res.locals.userinfo.username;
	contest.add(req.body,function(err,c){
		if(err)
			res.send("add failed");
		else
		res.redirect('/admin/contest/'+c.id);
	});
});


router.get('/problem/:pid', function(req, res) {
	problem.get(req.params.pid,function(err,p){
		if(err||!p)
			res.send("Cannot Found problem "+req.params.pid);
		else
			res.render('admin_problem', {p:p});
	});
});

router.get('/contest/:cid', function(req, res) {
	contest.get(req.params.cid,function(err,c){
		if(err||!c)
			res.send("Cannot Found contest "+req.params.cid);
		else
			res.render('admin_contest', {contest:c});
	});
});

router.post('/problem/:pid', function(req, res) {
	req.body.hidden=!!req.body.hidden;
	problem.update({id:req.params.pid},req.body,function(err){
		if(err)return res.Error(err,"无法找到题目："+req.params.pid);
		res.redirect('back');
	});
});

router.post('/contest/:cid', function(req, res) {
	user.get(req.body.manager,function(err,usr){
		if(!usr)
			delete req.body.manager;
		else
			req.body.manager=usr.username;
		contest.update({id:req.params.cid},req.body,function(err){
			if(err)return res.Error(err,"无法找到比赛："+req.params.cid);
			res.redirect('back');
		});
	});
});

router.get('/problem/:pid/delete', function(req, res) {
	problem.remove({id:req.params.pid},function(err,p){
		res.redirect('/admin/problem');
	});
});
router.get('/contest/:cid/delete', function(req, res) {
	contest.remove({id:req.params.cid},function(err,c){
		res.redirect('/admin/contest');
	});
});
router.get('/problem/:pid/data', function(req, res) {
	problem.get(req.params.pid,function(err,p){
		if(err||!p)
			res.send("Cannot Found problem "+req.params.pid);
		else
			res.render('admin_problem_data', {datas:p.data});
	});
});

router.get('/contest/:cid/problem', function(req, res) {
	contest.get(req.params.cid,function(err,c){
		if(err||!c)
			res.send("Cannot Found contest "+req.params.cid);
		else
			res.render('admin_contest_problem', {datas:c.problem});
	});
});
router.get('/contest/:cid/adduser', function(req, res) {
	contest.get(req.params.cid,function(err,c){
		if(err||!c)
			res.send("Cannot Found contest "+req.params.cid);
		else
			res.render('admin_contest_adduser', {datas:c.problem});
	});
});
router.get('/contest/:cid/similary', function(req, res) {
	var cid=req.params.cid;
	var cstatus=mongoose.model('contest_'+cid+'_status', status.schema);
	cstatus.find(function(err,s){
		var sim=[];
		var times=new Date;
		for(var i=0;i<s.length;i++)for(var j=i+1;j<s.length;j++)
		{
			if(s[i].user==s[j].user)continue;
			if(s[i].status!='Accepted'||s[j].status!='Accepted')continue;
			if(s[i].language[0]!=s[j].language[0])continue;
			var simmm=similary.similary(s[i].code,s[j].code,s[i].language);
			if(simmm<0.7)continue;
			var simm={
				similary:simmm,
				problem:s[i].problem
			};
			if(s[i].date<s[j].date)
			{
				simm['origin']=s[i];
				simm['copy']=s[j];
			}
			else
			{
				simm['origin']=s[j];
				simm['copy']=s[i];
			}
			sim.push(simm);
		}
		sim.sort(function(a,b){
			return b.similary-a.similary;
		});
		res.render('admin_contest_similary', {
			cid:cid,
			sim:sim,
			codenum:s.length,
			time:new Date-times
		});
	});
});
router.get('/problem/:pid/data/:id', function(req, res) {
	var pid=req.params.pid;
	var did=parseInt(req.params.id);
	problem.getData(pid,did,
	function(err,p){
		if(err)
			res.send('Cannot Found data '+req.params.id+' of problem '+req.params.pid);
		else
			res.render('admin_problem_data_view', {data:p});
	});
});
router.post('/problem/:pid/data/:id/delete', function(req, res) {
	problem.update({id:req.params.pid},{$pull:{data:{id:parseInt(req.params.id)}}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post('/contest/:cid/problem/:pid/delete', function(req, res) {
	var unsets={};
	unsets['maprob.'+req.params.pid]='';
	contest.update({id:req.params.cid},{$unset:unsets}).exec();
	contest.update({id:req.params.cid},{$pull:{problem:{id:req.params.pid}}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post('/problem/:pid/data',function(req, res) {
	problem.addData(req.params.pid,req.body,function(err){
		if(err)
			res.send("Add date failed!"+err);
		else
			res.redirect('back');
	});
});
router.post('/contest/:cid/problem',function(req, res) {
	problem.get(req.body.problem,function(err,p){
		if(err)return res.Error(err);
		if(!p)return res.Error(null,'无法找到题目：'+req.body.problem);
		req.body.title=p.title;
		var sets={};
		sets["maprob."+req.body.id]=req.body.problem;
		sets["sscount."+req.body.id]={submit:0,solved:0};
		contest.update({id:req.params.cid},{$set:sets}).exec();
		contest.update({id:req.params.cid},{$push:{problem:req.body}},function(err){
			if(err)
				res.send("Add problem failed!");
			else
				res.redirect('back');
		});
	});
});
router.post('/contest/:cid/adduser',function(req, res){
	contest.get(req.params.cid,function(err,c){
		var reglist=req.body.userlist.replaceAll('\r','').split('\n').map(function(u){
			u=u.split(' ');
			if(u.length!=2)return function(cb){cb(null)};
			var reginfo={
				username:u[0],
				password:u[1],
				email:'for contest '+c.id
			};
			return function(cb){
				user.add(reginfo,function(err){
					if(err)return cb(err);
					c.register(reginfo.username,cb);
				});
			};
		});
		async.parallel(reglist,function(err,results){
			if(err)
				res.send("Add User failed!\n"+err);
			else
				console.log(results),res.redirect('back');
		});
	});
});

router.post('/problem/:pid/show', function(req, res) {
	problem.update({id:req.params.pid},{$set:{hidden:false}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post('/problem/:pid/hide', function(req, res) {
	problem.update({id:req.params.pid},{$set:{hidden:true}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.get('/user/:username', function(req, res) {
	user.get(req.params.username,function(err,usr){
		if(err||!usr)
			res.send("Cannot Found user "+req.params.username);
		else
			res.render('admin_user', {user:usr});
	});
});
router.post('/user/:username', function(req, res) {
	user.update({lowername:req.params.username.toLowerCase()},req.body,function(err){
		if(err)
			res.send("Error:"+err);
		else
			res.redirect('back');
	});
});

router.get('/judger',function(req,res){
	judger.find(function(err,data){
		res.render('admin_judger', {judger:data});
	});
});
router.post('/judger',function(req,res){
	judger.create(req.body,function(err,data){
		judger.find(function(err,data){
			judge.init();
			res.redirect('back');
		});
	});
});
router.get('/judger/:name/delete',function(req,res){
	judger.remove({name:req.params.name},function(){
		res.redirect('/admin/judger');
	});
	
});
router.get("/discuss/:id/edit",function(req,res){
	discuss.get(req.params.id,function(err,post){
		if(err||!post)return res.Error(err,'无法找到话题：'+req.params.id);
		res.render('edittopic', {
			contest:null,
			post:post
		});
	});
});

router.post("/discuss/:id/edit",function(req,res){
	discuss.update({_id:req.params.id},{$set:req.body}).exec();
	res.redirect('back');
});

router.post("/discuss/:id/delete",function(req,res){
	discuss.remove({_id:req.params.id},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post("/discuss/:id/stick",function(req,res){
	discuss.update({_id:req.params.id},{$set:{stick:true}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post("/discuss/:id/unstick",function(req,res){
	discuss.update({_id:req.params.id},{$set:{stick:false}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post("/discuss/:id/delrep/:rid",function(req,res){
	discuss.update({_id:req.params.id},{$pull:{replay:{_id:req.params.rid}}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});


//contest discuss
router.get("/C/:cid/discuss/:id/edit",function(req,res){
	var cdiscuss=mongoose.model('contest_'+req.params.cid+'_discuss', discuss.schema);
	cdiscuss.get(req.params.id,function(err,post){
		if(err||!post)return res.Error(err,'无法找到话题：'+req.params.id);
		res.render('edittopic', {
			contest:req.params.cid,
			post:post
		});
	});
});

router.post("/C/:cid/discuss/:id/edit",function(req,res){
	var cdiscuss=mongoose.model('contest_'+req.params.cid+'_discuss', discuss.schema);
	cdiscuss.update({_id:req.params.id},{$set:req.body}).exec();
	res.redirect('back');
});

router.post("/C/:cid/discuss/:id/delete",function(req,res){
	var cdiscuss=mongoose.model('contest_'+req.params.cid+'_discuss', discuss.schema);
	cdiscuss.remove({_id:req.params.id},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post("/C/:cid/discuss/:id/stick",function(req,res){
	var cdiscuss=mongoose.model('contest_'+req.params.cid+'_discuss', discuss.schema);
	cdiscuss.update({_id:req.params.id},{$set:{stick:true}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post("/C/:cid/discuss/:id/unstick",function(req,res){
	var cdiscuss=mongoose.model('contest_'+req.params.cid+'_discuss', discuss.schema);
	cdiscuss.update({_id:req.params.id},{$set:{stick:false}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});
router.post("/C/:cid/discuss/:id/delrep/:rid",function(req,res){
	var cdiscuss=mongoose.model('contest_'+req.params.cid+'_discuss', discuss.schema);
	cdiscuss.update({_id:req.params.id},{$pull:{replay:{_id:req.params.rid}}},function(err){
		if(err)
			res.send('{"status":'+err+'}');
		else
			res.send('{"status":0}');
	});
});

module.exports = router;
