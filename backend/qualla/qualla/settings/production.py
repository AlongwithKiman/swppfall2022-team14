from .base import *
import os
DEBUG = True

ALLOWED_HOSTS = ['0.0.0.0','web','tipsybackend.shop','qualla.kro.kr',\
                '172.31.33.215',
                '15.164.171.23','ec2-15-164-171-23.ap-northeast-2.compute.amazonaws.com',
                 '3.34.194.217','ec2-3-34-194-217.ap-northeast-2.compute.amazonaws.com',
                 '3.39.189.88','ec2-3-39-189-88.ap-northeast-2.compute.amazonaws.com',
                 '13.125.144.254','ec2-15-164-95-176.ap-northeast-2.compute.amazonaws.com', 'ec2-13-125-227-250.ap-northeast-2.compute.amazonaws.com','15.164.224.81','ec2-15-164-224-81.ap-northeast-2.compute.amazonaws.com',"*"]

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
print(os.getcwd())
print(os.path.join(os.getcwd(),'db.sqlite3'))
# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        # 'NAME': BASE_DIR / '.db' / 'db.sqlite3',
        # 'NAME': BASE_DIR / 'db.sqlite3',
        'NAME': os.path.join(os.getcwd(),'db.sqlite3')
                
    }
}

MIDDLEWARE_CLASSES = (    
    'middleware.DisableCSRF',)
