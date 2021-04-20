var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
	res.cookie('username','',{ maxAge: 0,httpOnly:true, path:'/'});
	res.cookie('password','',{ maxAge: 0,httpOnly:true, path:'/'});
	res.redirect('/');
});

module.exports = router;
