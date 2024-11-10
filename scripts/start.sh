#!/bin/bash

UWSGI_INI=/home/ubuntu/uwsgi.ini
WORKING_DIR=/home/ubuntu/build/qualla
VENV_DIR=$WORKING_DIR/venv  # Define virtual environment directory

echo "[Deploy] : Kill old Gunicorn process"
# Terminate any existing gunicorn process
sudo pkill -f gunicorn -9

cd $WORKING_DIR

echo "[Deploy] : Setting up virtual environment"
# Create virtual environment if it doesn't exist
# Here for using python3.8
if [ ! -d "$VENV_DIR" ]; then
  python3.8 -m venv $VENV_DIR
fi

# Activate the virtual environment
source $VENV_DIR/bin/activate


echo "[Deploy] : Installing requirements in virtual environment"
# Upgrade pip and install requirements
pip3.8 install --upgrade pip
pip3.8 install -r requirements.txt



echo "[Deploy] : Migrate"
python3.8 manage.py makemigrations --settings=qualla.settings.production
python3.8 manage.py migrate --settings=qualla.settings.production




echo "[Deploy] : Starting Gunicorn server"
# Run Gunicorn within the virtual environment in the background


nohup $VENV_DIR/bin/gunicorn qualla.wsgi:application --bind 0.0.0.0:8000 --env DJANGO_SETTINGS_MODULE=qualla.settings.production &

# Deactivate the virtual environment
deactivate

