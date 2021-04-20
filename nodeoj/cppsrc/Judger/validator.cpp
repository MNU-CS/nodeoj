#include "judger.h"

namespace Judger
{
    inline bool isBlank(char c)
    {
        return c&&c<=' ';
    }
    void validate(Status &st,char *outFile,char *ansFile)
    {
        HANDLE fout=CreateFile(outFile,GENERIC_READ,FILE_SHARE_WRITE|FILE_SHARE_READ,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_READONLY,NULL);
        HANDLE fans=CreateFile(ansFile,GENERIC_READ,FILE_SHARE_WRITE|FILE_SHARE_READ,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_READONLY,NULL);
        int outsize=GetFileSize(fout,NULL);
        int anssize=GetFileSize(fans,NULL);
        if(outsize>outsize*3)
        {
            CloseHandle(fout);
            CloseHandle(fans);
            st.Status=OLE;
            return;
        }
        char *out=new char[outsize+1];
        char *ans=new char[anssize+1];
        out[outsize]=ans[anssize]=0;
        DWORD readsize;
        ReadFile(fout,out,outsize,&readsize,NULL);
        ReadFile(fans,ans,anssize,&readsize,NULL);
        CloseHandle(fout);
        CloseHandle(fans);

        bool ac=true;
        int po=0,pa=0;
        while(out[po]||ans[pa])
        {
            if(out[po]=='\r')
            {
                po++;
                continue;
            }
            if(out[pa]=='\r')
            {
                pa++;
                continue;
            }
            if(out[po]==ans[pa])
            {
                po++;
                pa++;
                continue;
            }
            int lfout=0,lfans=0;
            while(isBlank(out[po]))lfout+=out[po++]=='\n';
            while(isBlank(ans[pa]))lfans+=ans[pa++]=='\n';
            if(out[po]!=ans[pa])
            {
                st.Status=WA;
                return;
            }
            if(ac&&ans[pa]&&(out[po-1]!='\n'||ans[pa-1]!='\n'||lfout!=lfans))ac=false;
            if(out[po])po++;
            if(ans[pa])pa++;
        }
        st.Status=ac?AC:PE;
    }
}
