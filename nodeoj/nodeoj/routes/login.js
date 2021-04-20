var express = require('express');
var router = express.Router();
var user=require('./../models/user');

router.post('/', function(req, res) {
	var param=req.body;
	user.login(res,param.username,param.password,function(err,usr){
		if(err)
			res.send('{"status":"发生错误:'+err+'"}');
		else if(usr)
			res.send('{"status":0}');
		else
			res.send('{"status":"用户名或密码不正确"}');
	});
});

module.exports = router;
