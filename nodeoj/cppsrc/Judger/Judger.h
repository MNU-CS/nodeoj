#ifndef JUDGER_H
#define JUDGER_H
#include "windows.h"
#include "psapi.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#define AC "Accepted"
#define WA "Wrong Answer"
#define PE "Presentation Error"
#define TLE "Time Limit Exceeded"
#define MLE "Memory Limit Exceeded"
#define RE "Runtime Error"
#define OLE "Output Limit Exceeded"


namespace Judger
{

    struct Status
    {
        const char *Status;
        int UsedTime,UsedMemory;
        DWORD ExitCode;
    };
    Status run(char *runFile,char *inFile,char *outFile,int timeOut);
    Status judge(char *runFile,char *inFile,char *outFile,char *ansFile,int timeLimit,int memoryLimit,int memoryCorrect);
    void WriteStatus(Status &s);
    void validate(Status &st,char *outFile,char *ansFile);
    SIZE_T protect(HANDLE hProcess);
}
#endif // JUDGER_H
