var express = require('express');
var router = express.Router();
var contest = require('./../models/contest');
var async=require('async');
var toolkit=require('./../toolkit');

router.get(/^\/(\d*)\/?$/, function(req, res) {
  var page=req.params[0];
  if(page<1)page=1;
  if(!req.query.search)req.query.search='';
  var search=req.query.search;
  if(search)search=toolkit.query2rex(search);
  async.parallel([
		function(callback){contest.getlist(page,20,callback,search);},
		function(callback){contest.Count(callback,search);}
	],
	function(err,results){
		res.render('contestlist', {
				activeLink:'#contest',
				pageName:'contest',
				contests :results[0],
				maxPage:Math.ceil(results[1]/20),
				curPage:parseInt(page)
			  });
	});
});

module.exports = router;
