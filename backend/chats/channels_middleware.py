from channels.middleware import BaseMiddleware
from rest_framework.exceptions import AuthenticationFailed
from django.db import close_old_connections
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
from accounts.tokenauthentication import JWTAuthentication

User = get_user_model()

class JWTWebsocketMiddleware(BaseMiddleware):
    """
    JWT authentication middleware for WebSockets.
    Expects token as query parameter: ?token=JWT_HERE
    """

    async def __call__(self, scope, receive, send):
        close_old_connections()

        # Parse query string safely
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token_list = query_params.get('token', [])
        token = token_list[0] if token_list else None

        if not token:
            scope['user'] = AnonymousUser()
            await send({"type": "websocket.close", "code": 4000})
            return

        auth = JWTAuthentication()
        try:
            # authenticate_websocket now returns just the user
            user = await auth.authenticate_websocket(scope, token)

            if user is None:
                scope['user'] = AnonymousUser()
                await send({"type": "websocket.close", "code": 4001})
                return
            else:
                scope['user'] = user

            # Continue to the next middleware/application
            return await super().__call__(scope, receive, send)

        except AuthenticationFailed:
            await send({"type": "websocket.close", "code": 4002})
            return
