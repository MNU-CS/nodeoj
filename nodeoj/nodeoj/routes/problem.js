var express = require('express');
var router = express.Router();
var problem = require('./../models/problem');
var status=require('./../models/status');
var judge=require('./../judge').judge;

router.get('/:id', function(req, res) {
	problem.get(req.params.id,function(err,p){
		if(err||!p||(!res.locals.isadmin&&p.hidden))return res.Error(null,"无法找到问题："+req.params.id);
		res.render('problem', {
			activeLink:'#problem',
			p:p
		});
	});
});

router.post('/:id/submit', function(req, res) {
	if(!res.checklogin())return res.Error(null,"请先登录");
	problem.get(req.params.id,function(err,p){
		if(!res.locals.isadmin&&p.hidden)return res.Error(null,"无法找到题目");
		req.body.user=res.locals.userinfo.username;
		req.body.problem=req.params.id;
		status.add(req.body,function(err,data){
			if(err)return res.Error(null,"提交失败");
			res.locals.userinfo.update({$inc:{submissions:1}}).exec();
			judge(data);
			res.redirect('/Status');
		});
	});
});
module.exports = router;
