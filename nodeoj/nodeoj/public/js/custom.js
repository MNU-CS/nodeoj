$.ajaxSetup({  
    async : true  
});  

$(function() {
    $("[data-stopPropagation]").click(function(e) {
        e.stopPropagation();
    });
});
$("#btnLogin").click(function(){
	var username=$("#username").val().trim();
	var password=$("#password").val();
    $.post(
        '/login',
        {
			username:username,
			password:password
		},
        function(data)
        {
            if(data.status)
                alert(data.status);
			else
				location.reload();
        },
        "json"
	);
});

var myCodeMirror = null;
var codemode={
	"C":"text/x-csrc",
	"C++":"text/x-c++src",
	"Java":"text/x-java",
	'Python2.7':{
		name: "python",
        version: 2,
        singleLineStringErrors: false
	}
};
$("#submitcode").on('shown.bs.modal',function(){
	if(!myCodeMirror)myCodeMirror=CodeMirror.fromTextArea($('#codeeditor')[0], {
		indentUnit: 4,
		lineNumbers: true,
		matchBrackets: true,
		mode:  codemode[$("#language").val()]
	});
});
$("#language").click(function(){
	
	myCodeMirror.setOption('mode', codemode[localStorage.deflan=$(this).val()]);
});
$("[data-href]").click(function(){
	var self=$(this);
	location.href=self.attr("data-hrefhead")+$(self.attr("data-href")).val();
});

$("[data-status]").each(function(){
	var that=$(this);
	var cls={
				'Accepted':'label-success',
				'Presentation Error':'label-danger',
				'Time Limit Exceeded':'label-danger',
				'Memory Limit Exceeded':'label-danger',
				'Wrong Answer':'label-danger',
				'Runtime Error':'label-danger',
				'Output Limit Exceeded':'label-danger',
				'Compile Error':'label-warning',
				'System Error':'label-danger'
			}[that.attr('data-status')];
	if(!cls)cls="label-primary";
	that.addClass(cls);
});
$("[data-enter]").keydown(function(event){ 
	if(event.keyCode==13)$($(this).attr('data-enter')).click();
});
$("[data-ctrlenter]").keydown(function(event){ 
	if(event.keyCode==13&&event.ctrlKey)$($(this).attr('data-ctrlenter')).click();
});
$("#searchproblem").click(function(){
	var kw=$("#problemkw").val().trim();
	if(kw.match(/^\d{4}$/))
		location.href="/P/"+kw;
	else
		this.form.submit();
});
if(!localStorage.deflan)localStorage.deflan="C";
$("#language").val(localStorage.deflan)