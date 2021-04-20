#include "judger.h"
namespace Judger
{
    void WriteStatus(Status &s)
    {
        printf(
            "{\"status\":\"%s\","\
            "\"time\":%d,"\
            "\"memory\":%d,"\
            "\"exitCode\":%lu}\n",
            s.Status,s.UsedTime,s.UsedMemory,s.ExitCode
        );
    }
    Status judge(char *runFile,char *inFile,char *outFile,char *ansFile,int timeLimit,int memoryLimit,int memoryCorrect)
    {
        Status st=run(runFile,inFile,outFile,timeLimit<<1);
        st.UsedMemory -= memoryCorrect;
        if (st.UsedMemory < 0)
            st.UsedMemory = 0;
        if(st.ExitCode)
        {
            st.Status=RE;
            return st;
        }
        if(st.UsedMemory>memoryLimit)
        {
            st.Status=MLE;
            return st;
        }
        if(st.UsedTime>timeLimit)
        {
            st.Status=TLE;
            return st;
        }
        validate(st,outFile,ansFile);
        return st;
    }

}
