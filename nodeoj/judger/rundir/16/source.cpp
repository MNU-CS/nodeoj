#include <iostream>

using namespace std;

int main()
{
    int a;
    while(cin>>a)
    {
        int s = 0;
        for(int i = 1;i <= a;i ++)
            s += i;
        cout<<s<<endl;
    }
    return 0;
}
