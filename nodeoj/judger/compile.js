var exec = require('child_process').exec;
var fs=require('fs');
var iconv = require('iconv-lite');
var conf=require('./conf');
var compiler={
	'C':'gcc source.c -o main -O2 -Wall -DONLINE_JUDGE',
	'C++':'g++ source.cpp -o main -O2 -Wall -DONLINE_JUDGE',
	'Java':'javac Main.java',
	'Python2.7':''
};
var saveFile={
	'C':'source.c',
	'C++':'source.cpp',
	'Java':'Main.java',
	'Python2.7':'source.py'
};

module.exports=function(data,callback)
{
	var runDir=conf.runDir+data.contest+data.runid+'/';
	var sourceDir=runDir+saveFile[data.language];
	fs.mkdir(runDir,function(err,files){
		if(err&&err.code!='EEXIST')return callback(err);
		fs.writeFile(sourceDir,iconv.encode(data.code, 'gbk'),function(err){
			if(err)return callback(err);
			var compileCommand=compiler[data.language];
			if(!compileCommand)
				callback(null,{
					runid:data.runid,
					runDir:runDir,
					sourceDir:sourceDir
				});
			exec(compileCommand,{
				cwd:runDir,
				timeout:conf.compileTimeout,
				encoding:'binary'
			},
			function (err, stdout, stderr){
				var errs=iconv.decode(stderr,'gbk');
				if(err)
					callback(err,errs);
				else
					callback(null,{
						runid:data.runid,
						runDir:runDir,
						sourceDir:sourceDir,
						compileError:errs
					});
			});
		});
	});
}