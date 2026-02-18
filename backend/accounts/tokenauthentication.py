# import jwt
# from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
# from rest_framework.authentication import BaseAuthentication
# from rest_framework.exceptions import AuthenticationFailed
# from django.conf import settings
# from django.contrib.auth import get_user_model
# from datetime import datetime, timedelta
# from django.utils import timezone
# from channels.db import database_sync_to_async

# User=get_user_model()

# class JWTAuthentication(BaseAuthentication):

#     @database_sync_to_async
#     def authenticate_websocket(self, scope, token):
#         """Authenticate WebSocket connection with JWT token"""
#         try:
#             payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
#             self.verify_token(payload)  # Make sure you have this method

#             user_id = int(payload['id'])
#             user = User.objects.get(id=user_id)
#             return user  # Return just the user, not a tuple
#         except (InvalidTokenError, ExpiredSignatureError, User.DoesNotExist):
#             raise AuthenticationFailed("Invalid or expired token")

#     @staticmethod
#     def generate_token(payload):
#         expiration = timezone.now()+ timedelta(hours=24)
#         payload['exp'] = expiration
#         token = jwt.encode(payload=payload,key=settings.SECRET_KEY,algorithm='HS256')
#         return token
    
#     def extract_token(self,request):
#         auth_header = request.headers.get('Authorization')
#         if auth_header and auth_header.startswith('Bearer '):
#             return auth_header.split(' ')[1]
#         return None
    
#     def verify_token(self,payload):
#         if 'exp' not in payload:
#             raise InvalidTokenError("Token missing expiration claim")
        
#         exp_timestamp= payload["exp"]
#         current_timestamp = timezone.now().timestamp()

#         if current_timestamp > exp_timestamp:
#             raise ExpiredSignatureError("Token has expired")
        
    
#     def authenticate(self, request):
#         token = self.extract_token(request=request)
#         if not token:
#             return None
        
#         try:
#             payload = jwt.decode(token,settings.SECRET_KEY,algorithms=['HS256'])
#             self.verify_token(payload)

#             user_id = payload['id']
#             user = User.objects.get(id=user_id)
#             return (user, token)
#         except (InvalidTokenError, ExpiredSignatureError , User.DoesNotExist):
#             raise AuthenticationFailed("Invalid or expired token")
        

# accounts/tokenauthentication.py
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from django.utils import timezone
from channels.db import database_sync_to_async
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class JWTAuthentication(BaseAuthentication):

    @database_sync_to_async
    def authenticate_websocket(self, scope, token):
        """Authenticate WebSocket connection with JWT token"""
        try:
            # Decode the token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Verify token expiration
            self.verify_token(payload)

            # Get user_id from payload and convert to int safely
            user_id = payload.get('id')
            if not user_id:
                raise AuthenticationFailed("Token missing user ID")
            
            # Convert to int if it's a string
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                raise AuthenticationFailed("Invalid user ID format")

            # Get the user
            user = User.objects.get(id=user_id)
            
            # Check if user is active
            if not user.is_active:
                raise AuthenticationFailed("User account is inactive")
                
            return user
            
        except InvalidTokenError:
            raise AuthenticationFailed("Invalid token")
        except ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except User.DoesNotExist:
            raise AuthenticationFailed(f"User with ID {user_id} not found")
        except Exception as e:
            raise AuthenticationFailed(f"Authentication failed: {str(e)}")
    
   

    @staticmethod
    def generate_token(payload):
        expiration = timezone.now() + timedelta(hours=24)
        payload['exp'] = expiration
        token = jwt.encode(payload=payload, key=settings.SECRET_KEY, algorithm='HS256')
        return token
    
    def extract_token(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        return None
    
    def verify_token(self, payload):
        if 'exp' not in payload:
            raise InvalidTokenError("Token missing expiration claim")
        
        exp_timestamp = payload["exp"]
        current_timestamp = timezone.now().timestamp()

        if current_timestamp > exp_timestamp:
            raise ExpiredSignatureError("Token has expired")
    
    def authenticate(self, request):
        token = self.extract_token(request=request)
        if not token:
            return None
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            self.verify_token(payload)

            user_id = payload['id']
            user = User.objects.get(id=user_id)
            return (user, token)
        except (InvalidTokenError, ExpiredSignatureError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid or expired token")