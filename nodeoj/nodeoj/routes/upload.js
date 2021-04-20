var express = require('express');
var router = express.Router();
var fs=require('fs');

router.post('/', function(req, res) {
	if(!res.locals.isadmin)return res.send('no premissions');
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		var savepath='/images/'+(new Date().getTime())+'_'+filename;
		var fstream = fs.createWriteStream('./public'+savepath);
		file.pipe(fstream);
		fstream.on('close', function(err) {
			if(err)return res.send('Upload Error:'+err);
			res.send(
			'<script>'+
			'window.parent.CKEDITOR.tools.callFunction('+req.query.CKEditorFuncNum+',"'+savepath+'");'+
			'</script>'
			);
		});
	});
});

module.exports = router;
