#!/bin/bash

UWSGI_INI=/home/ubuntu/uwsgi.ini
WORKING_DIR=/home/ubuntu/build/qualla

echo "[Deploy] : Kill old uwsgi process"
sudo pkill -f uwsgi -9

cd $WORKING_DIR

echo "[Deploy] : Install Requirements"
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "[Deploy] : Migrate"
python manage.py makemigrations --settings=qualla.settings.production
python manage.py migrate --settings=qualla.settings.production

cd /home/ubuntu/

echo "[Deploy] : Running Uwsgi"
uwsgi -i $UWSGI_INI &

echo "[Deploy] : Running Nginx"
sudo systemctl start nginx
