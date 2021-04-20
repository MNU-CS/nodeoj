echo off
cls
g++.exe -Wall -fexceptions -O3 -fpermissive -static -c judger.cpp -o obj\Release\judger.o
g++.exe -Wall -fexceptions -O3 -fpermissive -static -c main.cpp -o obj\Release\main.o
g++.exe -Wall -fexceptions -O3 -fpermissive -static -c protector.cpp -o obj\Release\protector.o
g++.exe -Wall -fexceptions -O3 -fpermissive -static -c runner.cpp -o obj\Release\runner.o
g++.exe -Wall -fexceptions -O3 -fpermissive -static -c validator.cpp -o obj\Release\validator.o
g++.exe -static -o bin\Release\Judger.exe obj\Release\judger.o obj\Release\main.o obj\Release\protector.o obj\Release\runner.o obj\Release\validator.o  -s  -lpsapi
pause