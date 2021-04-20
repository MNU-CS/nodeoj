$("#deleteProblem,#deleteContest").click(function(){
	confirm("Confirm delete?")&&(location.href+=location.href.substr(-1)=='/'?'delete':'/delete');
});
function DeleteX(x)
{
	return function(id)
	{
		var idurl=location.href.substr(-x.length)===x?x+'/'+id:id;
		$.post(
			idurl+'/delete',
			{},
			function(data){
				if(data.status)return alert('Error:'+data.status);
				$("#"+x+"_"+id).remove();
			},
			'json'
		);
	};
}
var DeleteData=DeleteX('data');
var DeleteProblem=DeleteX('problem');

function Rejudge(id)
{
	$.post('/status/detail/'+id+'/rejudge');
}
function Recontestjudge(c,id)
{
	$.post('/C/'+c+'/status/detail/'+id+'/rejudge');
}
function PostReload(url)
{
	$.post(url,function(data){
		if(data.status)
			alert(data.status);
		else
			location.reload();
	},'JSON');
}
function StickPost(postid)
{
	PostReload('/admin/discuss/'+postid+'/stick');
}
function UnstickPost(postid)
{
	PostReload('/admin/discuss/'+postid+'/unstick');
}
function DeletePost(postid)
{
	PostReload('/admin/discuss/'+postid+'/delete');
}
function DeleteReplay(postid,repid)
{
	PostReload('/admin/discuss/'+postid+'/delrep/'+repid);
}
function ContestStickPost(cid,postid)
{
	PostReload('/admin/C/'+cid+'/discuss/'+postid+'/stick');
}
function ContestUnstickPost(cid,postid)
{
	PostReload('/admin/C/'+cid+'/discuss/'+postid+'/unstick');
}
function ContestDeletePost(cid,postid)
{
	PostReload('/admin/C/'+cid+'/discuss/'+postid+'/delete');
}
function ContestDeleteReplay(cid,postid,repid)
{
	PostReload('/admin/C/'+cid+'/discuss/'+postid+'/delrep/'+repid);
}
function HideProblem(pid)
{
	PostReload('/admin/problem/'+pid+'/hide');
}
function ShowProblem(pid)
{
	PostReload('/admin/problem/'+pid+'/show');
}