import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from chats.route import websocket_urlpatterns
from django.urls import path



os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Standard HTTP handling
application = get_asgi_application()

# ProtocolTypeRouter handles HTTP + WebSocket
application = ProtocolTypeRouter({
    'http': application,
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
