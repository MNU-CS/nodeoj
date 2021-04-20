var express = require('express');
var router = express.Router();
var user=require('./../models/user');
var contest=require('./../models/contest');
var discuss=require('./../models/discuss');
var async=require('async');

router.get('/', function(req, res) {

  async.parallel([
		function(callback){contest.getlist(1,10,callback);},
		function(callback){discuss.getlist(1,10,callback);}
	],
	function(err,results){
		res.render('index', {
			activeLink:'#home',
			contests :results[0],
			topics:results[1]
		});
	});
  

});

module.exports = router;
