from django.contrib import admin
from django.urls import path , include
from accounts.views import login,register_user


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/',register_user,name='register'),
    path('login/', login, name='login'),
]