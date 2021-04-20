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
	writeJson:function(socket,data)
	{
		return socket.write(JSON.stringify(data)+'\n');
	},
	endJson: function(socket,data)
	{
		return socket.end(JSON.stringify(data)+'\n');
	}
};
