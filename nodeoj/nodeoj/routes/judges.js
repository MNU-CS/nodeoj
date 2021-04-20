var express = require('express');
var router = express.Router();
var judger=require('./../models/judger');

router.get('/', function(req, res) {
	judger.find(function(err,data){
		res.render('judgers',{judger:data});	
	});
});
module.exports = router;
