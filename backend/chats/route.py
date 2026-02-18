from django.urls import path
from .consumers import PersonalChatConsumer

websocket_urlpatterns = [
    path('ws/chat/', PersonalChatConsumer.as_asgi()),
    path('ws/chat', PersonalChatConsumer.as_asgi()),
]