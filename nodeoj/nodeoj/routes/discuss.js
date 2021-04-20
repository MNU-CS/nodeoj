var express = require('express');
var router = express.Router();
var async=require('async');
var discuss=require('./../models/discuss');

router.post(/.*/,function(req,res,next){
	if(!res.locals.userinfo)return res.Error(null,'请先登录');
	req.body.author=res.locals.userinfo.username;
	next();
});

router.get(/^\/(?:P\/(\d+)\/?)?(\d*)\/?$/, function(req, res) {

  if(req.params.length==1)
  {
	var page=req.params[0];
	var shit={};
  }
  else
  {
    var problem=req.params[0]
    var page=req.params[1];
	var shit={problem:problem};
  }
  if(page<1)page=1;
  async.parallel([
		function(callback){discuss.getlist(page,20,callback,problem);},
		function(callback){discuss.count(shit,callback);}
	],
	function(err,results){
		res.render('discuss', {
				activeLink:'#discuss',
				pageName:'discuss',
				topics :results[0],
				maxPage:Math.ceil(results[1]/20),
				curPage:parseInt(page)
			  });
	});
});

router.post(/^\/(?:(?:P\/(\d+))?\/?)$/,function(req,res){
	var problem=parseInt(req.params[0]), data = req.body;
	if(problem) data.problem=problem;
	if(!data.title && !data.content)
		return res.Error({status: 400}, '请至少输入标题或内容其中一项！');
	discuss.add(data,function(err,c){
		if(!err)return res.redirect('/discuss/'+c._id);
		return res.Error(err,'提交失败！');
	});
});
router.get(/^\/([0-9a-fA-F]{24})\/?$/,function(req,res){
	var id=req.params[0];
	discuss.update({_id:id},{$inc:{view:1}}).exec();
	discuss.get(id,function(err,post){
		if(err||!post)return res.Error(err,"无法找到话题："+id);
		res.render('discuss_post', {
			activeLink:'#discuss',
			post:post
		});
	});
});
router.post(/^\/([0-9a-fA-F]{24})\/?$/,function(req,res){
	var id=req.params[0];
	discuss.update({_id:id},{$push:{replay:req.body}}).exec();
	res.redirect('back');
});

module.exports = router;
