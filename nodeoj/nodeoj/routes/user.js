var express = require('express');
var router = express.Router();
var user=require('./../models/user');

router.get('/', function(req, res) {
  res.render('user');
});

router.get('/:username', function(req, res) {
	user.get(req.params.username,function(err,users){
		if(err)return res.Error(err);
		if(!users)return res.Error(null,"无法找到用户："+req.params.username);
		res.render('users', {users:users});
	});
});
router.post('/', function(req, res) {
	var param=req.body;
	if(!res.checklogin())return;
	var usr=res.locals.userinfo;
	var data={};
	if(param.newpassword)
	{
		if(param.newpassword!=param.repassword)return req.send("确认新密码错误");
		if(param.oldpassword!=usr.password)return req.send("旧密码错误");
		usr.password=data.password=param.newpassword;
	}
	if(param.motto)usr.motto=data.motto=param.motto;
	usr.update(data).exec();
	res.render('user');

});
module.exports = router;
