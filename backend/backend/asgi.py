# backend/asgi.py
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Now you can import your channel-specific modules AFTER the app registry is ready
from channels.routing import ProtocolTypeRouter, URLRouter
from chats.route import websocket_urlpatterns
from chats.channels_middleware import JWTWebsocketMiddleware

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTWebsocketMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
