from django.urls import path
from . import views

urlpatterns = [
    path('cocktails/<int:cocktail_id>/',
         views.comment_list, name='comment list')
]
