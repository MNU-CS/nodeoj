#include "judger.h"

namespace Judger
{
    SIZE_T protect(HANDLE hProcess)
    {
        const char *InjectDLL="JudgerProtector.dll";
        char FullPath[255];
        GetModuleFileName(NULL,FullPath,255);
        strcpy(strrchr(FullPath,'\\')+1,InjectDLL);
        DWORD dwSize = strlen(FullPath)+1;
        PROCESS_MEMORY_COUNTERS pmc;
        GetProcessMemoryInfo(hProcess,&pmc,sizeof(pmc));
        SIZE_T usedMemory=pmc.PeakPagefileUsage;
        PVOID RemoteDLLStr = VirtualAllocEx(hProcess, NULL, dwSize, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
        WriteProcessMemory(hProcess, RemoteDLLStr, FullPath, dwSize, NULL);
        FARPROC ll=GetProcAddress(LoadLibrary("kernel32.dll"),"LoadLibraryA");
        HANDLE hRemoteThread=CreateRemoteThread(hProcess, NULL,NULL,(LPTHREAD_START_ROUTINE)ll,RemoteDLLStr,NULL,NULL);
        WaitForSingleObject(hRemoteThread,INFINITE);
        CloseHandle(hRemoteThread);
        GetProcessMemoryInfo(hProcess,&pmc,sizeof(pmc));
        return pmc.PeakPagefileUsage-usedMemory;
    }
}
