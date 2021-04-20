echo off
cls
g++.exe -O3 -Wall -fpermissive -static -DBUILD_DLL -c main.cpp -o obj\Release\main.o
g++.exe -shared -Wl,--output-def=bin\Release\libJudgerProtector.def -Wl,--out-implib=bin\Release\libJudgerProtector.a -Wl,--dll  obj\Release\main.o  -o bin\Release\JudgerProtector.dll -s -luser32
pause