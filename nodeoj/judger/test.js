var compile = require('./compile');
var cache=require('./cache');

var status={
	runid:2333,
	problem:1001,
	data:[1,2,3,4,5,6,7,8,9,10]
};
var newdata={
	runid:2333,
	problem:1001,
	data:[]
};
for(var i=1;i<=10;i++)
{
	newdata.data.push({
		id:i,
		input:'input_'+i,
		output:'output_'+i
	});
}

var judgeData={
	runid:1234567,
	language:'C++',
	code:'#include <stdio.h>\n'+
		 'int main(){int a,b;long long c;scanf("%d%lld",&a,&c);b=c;printf("%d",a+b);return 0;}'
};
compile(judgeData,function(err){
	//console.log('err from caller:'+err);
});
