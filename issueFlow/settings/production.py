"""
Production
Django settings for warehouse project.
Generated by 'django-admin startproject' using Django 1.8.5.
"""

from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '4k6irf(q-=4key-p+)ur6m#2a+t+0%+1gfg4ps#8gwv9g-jf51'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['127.0.0.1']

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }

}
