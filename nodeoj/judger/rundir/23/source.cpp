#include <iostream>
#include <algorithm>
#include <cstdio>
using namespace std;

int a[200005];

int main()
{
    int t ;
    cin >> t;
    while (t--)
    {
        int n;
        scanf("%d", &n);
        for(int i = 0; i < n; i++)
            scanf("%d", a + i);
        sort(a, a + n);
        printf("%d", a[0]);
        for(int i = 1; i < n; i++)
            printf(" %d", a[i]);
        putchar('\n');
    }
    return 0;
}
