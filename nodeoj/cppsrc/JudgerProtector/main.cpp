#include "main.h"
#define SIZEOF(x) (sizeof(x)/sizeof(x[0]))
struct
{
    const char *module,*func;
} HookList[]=
{
        {"Advapi32.dll", "AdjustTokenPrivileges"},
        {"Kernel32.dll", "CreateProcessA"},
        {"Kernel32.dll", "CreateProcessW"},
        {"Kernel32.dll", "CreateNamedPipeA"},
        {"Kernel32.dll", "CreateNamedPipeW"},
        {"Kernel32.dll", "CreatePipeA"},
        {"Kernel32.dll", "CreatePipeW"},

        {"Kernel32.dll", "OpenProcess"},
        {"Kernel32.dll", "ConnectNamedPipe"},

        //{"Kernel32.dll", "CreateFileA"},
        //{"Kernel32.dll", "CreateFileW"},
        {"Kernel32.dll", "CopyFileA"},
        {"Kernel32.dll", "CopyFileW"},
        {"Kernel32.dll", "CopyFileExA"},
        {"Kernel32.dll", "CopyFileExW"},
        {"Kernel32.dll", "DeleteFileA"},
        {"Kernel32.dll", "DeleteFileW"},
        {"Kernel32.dll", "WriteFileA"},
        {"Kernel32.dll", "WriteFileW"},

        {"Kernel32.dll", "Sleep"},
        {"Kernel32.dll", "SleepEx"},

        //Psapi
        {"Psapi.dll", "EnumProcesses"},
        {"Psapi.dll", "EnumPageFiles"},
        {"Psapi.dll", "EnumDeviceDrivers"},
        {"Psapi.dll", "EmptyWorkingSet"},
        {"Psapi.dll", "EnumProcessModules"},
        {"Psapi.dll", "InitializeProcessForWsWatch"},
        {"Psapi.dll", "QueryWorkingSet"},

        //Ws2_32
        //{"Ws2_32.dll", "WSAStartup"},
        {"Ws2_32.dll", "socket"},
        {"Ws2_32.dll", "WSACleanup"},
        {"Ws2_32.dll", "connect"},
        {"Ws2_32.dll", "send"},
        {"Ws2_32.dll", "recv"},
        {"Ws2_32.dll", "bind"},
        {"Ws2_32.dll", "listen"},
        {"Ws2_32.dll", "accept"},
        {"Ws2_32.dll", "WSARecv"},
        {"Ws2_32.dll", "WSARecvEx"},
        {"Ws2_32.dll", "recvfrom"},
        {"Ws2_32.dll", "sendto"},
        {"Ws2_32.dll", "WSAAccept"},
        {"Ws2_32.dll", "WSAConnect"},
        //{"Ws2_32.dll", "WSACreateEvent"},
        {"Ws2_32.dll", "WSARecvFrom"},
        {"Ws2_32.dll", "WSASend"},
        {"Ws2_32.dll", "WSASendTo"},
        {"Ws2_32.dll", "WSASetServiceA"},
        {"Ws2_32.dll", "WSASetServiceW"},
        //{"Ws2_32.dll", "WSASocketA"},
        //{"Ws2_32.dll", "WSASocketW"},

        //Internet
        {"wininet.dll", "InternetOpenA"},
        {"wininet.dll", "InternetOpenW"},
        {"wininet.dll", "InternetSetCookieA"},
        {"wininet.dll", "InternetSetCookieW"},
        {"wininet.dll", "InternetConnectA"},
        {"wininet.dll", "InternetConnectW"},
        {"wininet.dll", "HttpSendRequestA"},
        {"wininet.dll", "HttpSendRequestW"},
        {"wininet.dll", "SQLConnect"},
        {"wininet.dll", "InternetReadFile"}


};

DWORD __stdcall ExitProc()
{
    ExitProcess(233);
}
void Hook()
{
    char jmpcode[5]={(char)0xe9};
    DWORD *jmpaddr=(DWORD*)(jmpcode+1);
    for(size_t i=0;i<SIZEOF(HookList);++i)
    {
        DWORD func=(DWORD)GetProcAddress(LoadLibrary(HookList[i].module),HookList[i].func);
        if(!func)continue;
        *jmpaddr=(DWORD)ExitProc-func-5;
        WriteProcessMemory(INVALID_HANDLE_VALUE,(LPVOID) func,jmpcode,5,NULL);
    }
}

extern "C" DLL_EXPORT BOOL APIENTRY DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved)
{
    switch (fdwReason)
    {
        case DLL_PROCESS_ATTACH:
            Hook();
            break;

        case DLL_PROCESS_DETACH:
            // detach from process
            break;

        case DLL_THREAD_ATTACH:
            // attach to thread
            break;

        case DLL_THREAD_DETACH:
            // detach from thread
            break;
    }
    return TRUE; // succesful
}
