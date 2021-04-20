var express = require('express');
var router = express.Router();
var user=require('./../models/user');
var async=require('async');
router.get(/^\/(\d*)\/?$/, function(req, res) {
	var page=req.params[0];
	if(page<1)page=1;

  async.parallel([
		function(callback){user.ranklist(page,50,callback);},
		function(callback){user.count({submissions:{$gt:0}},callback);}
	],
	function(err,results){
		res.render('ranklist', {
				activeLink:'#ranklist',
				pageName:'ranklist',
				ranklist :results[0],
				maxPage:Math.ceil(results[1]/20),
				curPage:parseInt(page)
			  });
	});
});
module.exports = router;
