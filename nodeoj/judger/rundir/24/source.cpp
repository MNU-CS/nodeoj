#include <algorithm>
#include <cstdio>
using namespace std;

int a[200005];

inline int get_uint()
{
    int ch = getchar();
    while (ch > '9' || ch < '0')
        ch = getchar();
    int ret = ch - '0';
    while ((ch = getchar()) <= '9' && ch >= '0')
        ret = ret * 10 + (ch - '0');
    return ret;
}

int main()
{
    int t = get_uint();
    while (t--)
    {
        int n = get_uint();
        for(int i = 0; i < n; i++)
            a[i] = get_uint();
        sort(a, a + n);
        printf("%d", a[0]);
        for(int i = 1; i < n; i++)
            printf(" %d", a[i]);
        putchar('\n');
    }
    return 0;
}
