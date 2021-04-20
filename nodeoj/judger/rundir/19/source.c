#include<stdio.h>
int main()
{
	unsigned int n;
	while(scanf("%ld",&n)!=EOF)
	{
	  printf("%d\n\n",(1+n)*n/2);
	}
	return 0;
}