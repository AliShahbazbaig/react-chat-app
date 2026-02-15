from django.contrib import admin
from django.urls import path
from accounts.views import register_user

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/',register_user,name='register')
]
