#include <iostream>
#include <algorithm>
#include <cstdio>
using namespace std;

int main()
{
    int f[200005];
    int t ;
    cin>>t;
    while(t -- )
    {
        int a;
        scanf("%d",&a);

        for(int i = 0;i < a;i ++)
            scanf("%d",&f[i]);
            sort(f,f+a);
        for(int i = 0;i < a;i ++)
            printf("%d ",f[i]);
        cout<<endl;
    }

    return 0;
}
