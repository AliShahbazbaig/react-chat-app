import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from django.utils import timezone

User=get_user_model()

class JWTAuthentication(BaseAuthentication):

    @staticmethod
    def generate_token(payload):
        expiration = timezone.now()+ timedelta(hours=24)
        payload['exp'] = expiration
        token = jwt.encode(payload=payload,key=settings.SECRET_KEY,algorithm='HS256')
        return token
    
    def extract_token(self,request):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        return None
    
    def verify_token(self,payload):
        if 'exp' not in payload:
            raise InvalidTokenError("Token missing expiration claim")
        
        exp_timestamp= payload["exp"]
        current_timestamp = timezone.now().timestamp()

        if current_timestamp > exp_timestamp:
            raise ExpiredSignatureError("Token has expired")
        
    
    def authentication(self, request):
        token = self.extract_token(request=request)
        if not token:
            return None
        
        try:
            payload = jwt.decode(token,settings.SECRET_KEY,algorithms=['HS256'])
            self.verify_token(payload)

            user_id = payload['id']
            user = User.objects.get(id=user_id)
            return (user)
        except (InvalidTokenError, ExpiredSignatureError , User.DoesNotExist):
            raise AuthenticationFailed("Invalid or expired token")
        

