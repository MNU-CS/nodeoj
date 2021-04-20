var express = require('express');
var router = express.Router();
var problem = require('./../models/problem');
var async=require('async');
var toolkit=require('./../toolkit');

router.get(/^\/(\d*)\/?$/, function(req, res) {
  var page=req.params[0];
  if(!req.query.search)req.query.search='';
  var search=req.query.search;
  if(search)search=toolkit.query2rex(search);
  if(page<1)page=1;
  async.parallel([
		function(callback){problem.getlist(page,30,callback,res.locals.isadmin,search);},
		function(callback){problem.Count(callback,res.locals.isadmin,search);}
	],
	function(err,results){
		res.render('problemlist', {
				activeLink:'#problem',
				pageName:'Problem',
				problems :results[0],
				maxPage:Math.ceil(results[1]/30),
				curPage:parseInt(page)
			  });
	});
});

module.exports = router;
