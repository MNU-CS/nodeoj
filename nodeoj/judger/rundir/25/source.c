#include <stdio.h>
#include <stdlib.h>

int cmp(const void *a,const void *b){
   return *(int *)a-*(int *)b;
}
int main()
{
    int n,m,i,d;
    scanf("%d",&n);
    while(n--){
        scanf("%d",&m);
        long long a[200005]={0};
        for(i=0;i<m;i++)
            scanf("%lld",&a[i]);
        qsort(a,m,sizeof(__int64),cmp);
        for(i=0;i<m-1;i++)
            printf("%d ",a[i]);
        printf("%d\n",a[i]);
    }
    return 0;
}
