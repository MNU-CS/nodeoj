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
            cin>>d[i];
        }
        sort(d,d+b);
        for(int i=0;i<b;i++)
        {
            if(i=!b-1)
                cout<<d[i]<<' ';
            else cout<<d[i];
        }
        cout<<endl;
    }
    return 0;
}