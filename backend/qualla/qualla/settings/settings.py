from .base import *

DEBUG = True

ALLOWED_HOSTS = ['','0.0.0.0','web','tipsybackend.shop','qualla.kro.kr',\
                 '3.39.189.88','ec2-3-39-189-88.ap-northeast-2.compute.amazonaws.com',
                 '3.34.194.217','ec2-3-34-194-217.ap-northeast-2.compute.amazonaws.com'
                 '13.209.77.169','ec2-13-209-77-169.ap-northeast-2.compute.amazonaws.com',\
                 '13.125.144.254','ec2-15-164-95-176.ap-northeast-2.compute.amazonaws.com', 'ec2-13-125-227-250.ap-northeast-2.compute.amazonaws.com','15.164.224.81','ec2-15-164-224-81.ap-northeast-2.compute.amazonaws.com']

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent

# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / '.db' / 'db.sqlite3',
    }
}
