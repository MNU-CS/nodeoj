#include "judger.h"

using namespace Judger;

int main(int argc,char *argv[])
{
/*
    run("E:\\project\\Judger_node\\rundir\\117\\main.exe",
        "E:\\project\\Judger_node\\rundir\\117\\4.in",
        "E:\\project\\Judger_node\\rundir\\117\\4.out",
        10000);


    return 0;
*/
    char *runFile,*inFile,*outFile,*ansFile;
    int timeLimit=1000, memoryLimit=65535, memoryCorrect = 0;

    switch(argc)
    {
    case 8:
        memoryCorrect = atoi(argv[7]);
    case 7:
        timeLimit = atoi(argv[5]);
        memoryLimit = atoi(argv[6]);
    case 5:
        runFile = argv[1];
        inFile = argv[2];
        outFile = argv[3];
        ansFile = argv[4];
        break;
    default:
        printf(
               "Usage:\n"\
               "%s ExeFile InFile OutFile AnsFile TimeLimit MemoryLimit MemoryCorrect\n"\
               "%s ExeFile InFile OutFile AnsFile TimeLimit MemoryLimit\n"\
               "%s ExeFile InFile OutFile AnsFile\n"
        ,argv[0],argv[0],argv[0]);
        return 0;
    }
    Status st=judge(runFile,inFile,outFile,ansFile,timeLimit,memoryLimit,memoryCorrect);
    WriteStatus(st);
    return 0;
}
