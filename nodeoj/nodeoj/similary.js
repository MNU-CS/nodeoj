var shitwindows=[/\r/g];
var commons={
	"Python2.7":[
		/#.*?\n/g,
		/'''.*?'''/g,
		/""".*?"""/g,
	],
	"C":[
		/\/\/.*?\n/g,
		/\/\*.*?\*\//g
	]
};

function delstr(str,re)
{
	for(var i=0;i<re.length;i++)
	{
		str=str.replace(re[i],'');
	}
	return str.replace(/\n+/g,'\n')
			  .replace(/[\f\t\v\r ]+/g,' ')
			  .replace(/\n+/g,'\n');
}
function lcs(s1,s2)
{
	var dp=new Array(s1.length+1);
	for(var i=0;i<=s1.length;i++)
	{
		dp[i]=new Array(s2.length+1);
		dp[i][0]=0;
	}
	for(var i=0;i<=s2.length;i++)dp[0][i]=0;

	for(var i=0;i<s1.length;i++)
		for(var j=0;j<s2.length;j++)
			dp[i+1][j+1]=s1[i]==s2[j]?dp[i][j]+1:Math.max(dp[i+1][j],dp[i][j+1]);
	return dp[s1.length][s2.length];
}
function kwzation(code)
{
	var kwlist=/\!|\%|\&|\(|\)|\*|\=|\+|\,|\-|\>|\#|\.|\}|\{|\/|\:|\;|\<|\?|\[|\]|\^|\||\~|\W(reinterpret_cast|synchronized|dynamic_cast|static_cast|instanceof|implements|const_cast|transient|push_back|protected|namespace|make_pair|interface|algorithm|volatile|unsigned|template|register|operator|nonlocal|iterator|iostream|explicit|continue|abstract|wchar_t|virtual|typedef|private|package|mutable|include|finally|extends|default|cstring|cstdlib|boolean|vector|typeid|throws|switch|struct|string|static|sizeof|signed|return|public|native|lambda|insert|inline|import|global|friend|extern|export|except|double|delete|cstdio|cctype|assert|yield|while|using|union|throw|super|stack|short|raise|queue|float|final|false|const|cmath|class|catch|break|False|main|with|void|true|this|sort|pass|null|long|goto|from|enum|else|elif|char|case|byte|bool|auto|True|None|try|set|not|new|map|int|for|del|def|asm|and|or|is|in|if|do|as)\W|\n/g;
	return code.replace(/\r/g,'') //去除蛋疼的\r
			   .replace(/(\#include.*?\<)(.*?)\.h.*?\>/g,'$1c$2>')
			   .replace(/((?:\#|\}|\{).*?)\n/g,'$1;\n') //给需要换行的加上;
			   .replace(/(\W)/g,' $1 ') //给符号用空格分开,避免匹配不到
			   .match(kwlist) //匹配关键字
			   .join('') //拼接为整个字符
			   .replace(/\s/g,'') //去除空字符
			   .replace(/\;/g,'\n'); //把;替换为换行符
}
exports.similary=function(c1,c2,lan)
{
	var replist=shitwindows.concat((lan==='Python2.7'?commons[lan]:commons['C']));
	c1=delstr(c1,replist);
	c2=delstr(c2,replist);
	if(lan==='Python2.7')
	{
		c1=c1.replace(/\n/g,';\n');
		c2=c2.replace(/\n/g,';\n');
	}
	c1=kwzation(c1);
	c2=kwzation(c2);
	if(c1.replace(/\s/g,'')==c2.replace(/\s/g,''))return 1;
	c1=c1.split('\n');
	c2=c2.split('\n');
	var l=(c1.length+c2.length)/2;
	return lcs(c1,c2)/l;
}
