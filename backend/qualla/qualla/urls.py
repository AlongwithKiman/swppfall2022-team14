"""qualla URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('api/v1/cocktails/', include('cocktail.urls')),
    path('api/v1/cocktails/', include('ingredient_prepare.urls')),
    path('api/v1/ingredients/', include('ingredient.urls')),
    path('api/v1/bookmark/', include('bookmark.urls')),
    path('api/v1/comment/', include('comment.urls')),
    path('api/v1/tag/', include('tag.urls')),
    path('api/v1/user/', include('user.urls')),
    path('api/v1/auth/', include('user.urls')),
    path('api/v1/store/', include('store.urls')),
    path('api/v1/rates/', include('rate.urls')),
    path('api/v1/ping/',include('ping.urls')),
    path('admin/', admin.site.urls),
]
