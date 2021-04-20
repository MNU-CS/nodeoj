echo off
cls
cd %NGINX_HOME% & C:
start nginx
cd %NODEOJ_HOME% & D:
pm2 start nodeoj.json
echo "Success to startup NodeOJ!"
pause