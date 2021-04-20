var express = require('express');
var router = express.Router();
var status = require('./../models/status');
var judge=require('./../judge').judge;
var async=require('async');
router.get(/^\/(\d*)\/?$/, function(req, res) {
  var page=req.params[0];
  if(page<1)page=1;
  var filter={};
  var filterItem=['problem','status','language'];
  for(var i=0;i<filterItem.length;i++)
  {
	if(req.query[filterItem[i]])filter[filterItem[i]]=req.query[filterItem[i]];
  }
  if(req.query.user)filter.user={$regex:new RegExp("^"+req.query.user.toRegexStr()+"$",'i')}

  async.parallel([
		function(callback){status.getlist(filter,page,20,callback);},
		function(callback){status.count(filter,callback);}
	],
	function(err,results){
		res.render('status', {
			activeLink:'#status',
			pageName:'Status',
			status :results[0],
			maxPage:Math.ceil(results[1]/20),
			curPage:parseInt(page)
		  });
	});
});
router.get('/detail/:runid',function(req,res){
	status.get(req.params.runid,function(err,data){
	  res.render('status_detail', {
		activeLink:'#status',
		status :data
	  });
	});
});
router.post('/detail/:runid/rejudge',function(req,res){
	if(res.locals.isadmin)
	status.get(req.params.runid,function(err,data){
	  judge(data,true);
	});
	res.end();
});
module.exports = router;
