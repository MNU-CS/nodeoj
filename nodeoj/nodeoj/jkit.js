module.exports = {
	status:{
		AC:'Accepted',
		PE:'Presentation Error',
		TLE:'Time Limit Exceeded',
		MLE:'Memory Limit Exceeded',
		WA:'Wrong Answer',
		RE:'Runtime Error',
		OLE:'Output Limit Exceeded',
		CE:'Compile Error'
	},
	fstatus:{
		'Presentation Error':'PE',
		'Time Limit Exceeded':'TLE',
		'Memory Limit Exceeded':'MLE',
		'Wrong Answer':'WA',
		'Runtime Error':'RE',
		'Output Limit Exceeded':'OLE'
	},
	writeJson:function(socket,data)
	{
		return socket.write(JSON.stringify(data)+'\n');
	},
	endJson: function(socket,data)
	{
		return socket.end(JSON.stringify(data)+'\n');
	}
};
