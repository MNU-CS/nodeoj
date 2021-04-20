#include "judger.h"

namespace Judger
    {

    Status run(char *runFile,char *inFile,char *outFile,int timeOut)
    {
        SECURITY_ATTRIBUTES sa={sizeof(sa)};
        sa.bInheritHandle=TRUE;
        HANDLE input=CreateFile(inFile,GENERIC_READ,FILE_SHARE_WRITE|FILE_SHARE_READ,&sa,OPEN_EXISTING,FILE_ATTRIBUTE_READONLY,NULL);
        HANDLE output=CreateFile(outFile,GENERIC_WRITE,FILE_SHARE_WRITE|FILE_SHARE_READ,&sa,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
        STARTUPINFO si={sizeof(si)};
        PROCESS_INFORMATION pi={};
        si.dwFlags=STARTF_USESTDHANDLES;
        si.hStdInput=input;
        si.hStdOutput=output;

        Status st;
        if(CreateProcess(NULL,runFile,NULL,NULL,TRUE,CREATE_SUSPENDED,NULL,NULL,&si,&pi))
        {
            SIZE_T protectorsize=protect(pi.hProcess);
            ResumeThread(pi.hThread);
            WaitForSingleObject(pi.hProcess,timeOut);
            TerminateProcess(pi.hProcess,0);
            GetExitCodeProcess(pi.hProcess, &st.ExitCode);

            FILETIME lpCreationTime,lpExitTime,lpKernelTime,lpUserTime;
            GetThreadTimes(pi.hThread,&lpCreationTime,&lpExitTime,&lpKernelTime,&lpUserTime);
            st.UsedTime=lpUserTime.dwLowDateTime/10000;
            PROCESS_MEMORY_COUNTERS pmc;
            GetProcessMemoryInfo(pi.hProcess,&pmc,sizeof(pmc));
            st.UsedMemory=(pmc.PeakPagefileUsage-protectorsize)/1024;

            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
            CloseHandle(input);
            CloseHandle(output);
        }
        return st;
    }
}
