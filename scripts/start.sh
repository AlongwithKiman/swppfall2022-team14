#!/bin/bash

UWSGI_INI=/home/ubuntu/uwsgi.ini
WORKING_DIR=/home/ubuntu/build/qualla

echo "[Deploy] : Kill old uwsgi process"
sudo pkill -f gunicorn -9

cd $WORKING_DIR

echo "[Deploy] : Install Requirements"
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "[Deploy] : Migrate"
python manage.py makemigrations --settings=qualla.settings.production
python manage.py migrate --settings=qualla.settings.production

echo "[Deploy] : Running Gunicorn"
sudo nohup gunicorn qualla.wsgi:application --bind 0.0.0.0:80 &

# echo "[Deploy] : Running Nginx"
# sudo systemctl start nginx
# if ! type docker > /dev/null
# then
#   echo "docker does not exist"
#   echo "Start installing docker"
#   sudo apt-get update
#   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
#   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
#   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
#   sudo apt update
#   apt-cache policy docker-ce
#   sudo apt install -y docker-ce
# fi

# # docker-compose가 없다면 docker-compose 설치
# if ! type docker-compose > /dev/null
# then
#   echo "docker-compose does not exist"
#   echo "Start installing docker-compose"
#   sudo curl -L "https://github.com/docker/compose/releases/download/1.27.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
#   sudo chmod +x /usr/local/bin/docker-compose
# fi

# echo "start docker: ubuntu"
# sudo docker pull expfunsce/tipsybackend:latest
# sudo docker run -d -p 80:80 -p 443:443 expfunsce/tipsybackend:latest
