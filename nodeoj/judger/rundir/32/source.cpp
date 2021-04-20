#include <algorithm>
#include <cstdio>
#include <iostream>
using namespace std;
int main()
{
	int a,b;int d[200001];
    cin>>a;
    while(a--)
    {
        cin>>b;
        for(int i=0;i<b;i++)
        {
            scanf("%d",&d[i]);
        }
        sort(d,d+b);
        for(int i=0;i<b;i++)
        {
            if(i!=b-1)
                printf("%d ",d[i]);
            else cout<<d[i];
        }
        cout<<endl;
    }
    return 0;
}