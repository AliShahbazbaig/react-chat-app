"""
WebSocket URL routing for the chats application.

This module defines the URL patterns for WebSocket connections used in real-time
chat functionality. All WebSocket connections require JWT authentication via
query parameter (?token=JWT_HERE).

Endpoints:
    /ws/chat/<conversation_id>/
        - Real-time chat messages for a specific conversation
        - Supports direct messages and group chats
        - Handles typing indicators and read receipts
"""

from django.urls import path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    # Chat WebSocket endpoint - supports conversation messaging, typing, and read receipts
    # Accepts both with and without trailing slash
    path('ws/chat/<int:conversation_id>/', ChatConsumer.as_asgi(), name='ws-chat'),
    path('ws/chat/<int:conversation_id>', ChatConsumer.as_asgi()),
]
