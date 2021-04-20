var express = require('express');
var router = express.Router();
var user=require('./../models/user');


router.get('/', function(req, res) {
	res.locals.userinfo?res.redirect('/'):res.render('register');
});

router.post('/', function(req, res) {
	var param=req.body;
	if(param.password!=param.repassword)return res.Error(null,"确认密码错误");

	param.username=param.username.trim();
	delete param.repassword;
	user.add(param,function(err,usr){
		if(err)return res.send(err);
		usr.setcookie(res);
		res.redirect('/');
	});
});

module.exports = router;
