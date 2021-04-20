echo off
cls
cd %NGINX_HOME% & C:
nginx -s quit
pm2 stop all
echo "Success to shutdown NodeOJ!"
pause
