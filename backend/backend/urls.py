from django.contrib import admin
from django.urls import path , include
from accounts.views import login,register_user
from chats.views import get_user_list

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/',register_user,name='register'),
    path('api/login/', login, name='login'),
    path('api/users/',get_user_list,name='user-list'),

]