var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var judge=require('./judge');
var ejs = require('ejs');
var app = express();
var busboy = require('connect-busboy');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(require('morgan')('dev'));
app.use(bodyParser.json({limit: '128mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '128mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());

var conf=require('./conf');
var user=require('./models/user');
app.use(function(req, res, next) {
	res.Error=function(err,message,status){
		this.render('error', {err:err,message:message,status:err&&err.status||status||500});
	};
	user.autologin(req,res,function(err,usr){
		res.locals={
			userinfo:usr||'',
			isadmin:usr&&usr.userGroup>=1,
			activeLink:'',
			title: conf.siteTitle ,
			req:req,
			description:conf.siteDescription,
			AllowLanguage:['C','C++','Java','Python2.7'],
			AllowStatus:['Accepted','Presentation Error','Time Limit Exceeded','Memory Limit Exceeded','Wrong Answer','Runtime Error','Output Limit Exceeded','Compile Error','System Error']
		};
		res.locals.userinfo.allow=function(premission){
			if(this.userGroup)return true;
			return false;
		};
		res.checklogin=function(premission)
		{
			if(this.locals.userinfo)
			{
				if(premission&&!this.locals.userinfo.allow(premission))
				{
					this.Error(null,"没有足够的权限");
					return false;
				}
				return true;
			}
			this.Error(null,"请先登录");
			return false;
		}
		next();
	});
});

var tookit=require('./toolkit');
tookit.router(app,'./routes');
app.R('','index')
   .R('problem','problemlist')
   .R('p','problem')
   .R('contest','contestlist')
   .R('c','contest')
   .R('admin')
   .R('status')
   .R('register')
   .R('discuss')
   .R('ranklist')
   .R('login')
   .R('logout')
   .R('user')
   .R('judges')
   .R('upload')
   .SR('contact')
   .SR('about')
   .SR('faq');


var mongoose = require('mongoose');
mongoose.connect(conf.dbConn);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.Error(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(800);