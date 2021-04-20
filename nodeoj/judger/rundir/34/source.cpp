#include <iostream>
#include <algorithm>
#include<stdio.h>
#include <stdlib.h>
using namespace std;

int main()
{
    int t;
    scanf("%d",&t);
    while(t--)
    {
        int n,i;
        int a[200000];
        scanf("%d",&n);
        for(i=0;i<n;i++)
            scanf("%d",&a[i]);
        sort(a,a+n);
        for(i=0;i<n;i++)
        {
             printf("%d",a[i]);
             if(i!=n-1)
                printf(" ");
        }
        printf("\n");
    }
    return 0;
}
