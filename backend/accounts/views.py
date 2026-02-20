from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from accounts.tokenauthentication import JWTAuthentication
from .serializers import LoginSerializer,UserSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework import generics
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

User=get_user_model()


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user=serializer.context['user']
        user.is_online=True
        user.last_seen=timezone.now()
        user.save(update_fields=['is_online','last_seen'])
        token = JWTAuthentication.generate_token(payload=serializer.data)

        return Response({
            'message': 'Login successful',
            'token': token,
            'user': serializer.data,
            }, 
            status=status.HTTP_201_CREATED
            )
    else:
        errors = serializer.errors
        if not errors.get('non_field_errors'):
            errors['non_field_errors'] = ['Unable to log in with provided credentials.']
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_user(request):
    serializer= UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs.get('id')
        if user_id:
            user = User.objects.get(id=user_id)
            if user != self.request.user:
                raise PermissionDenied("You do not have permission to access this user's details.")
        else:
            user = self.request.user
        
        user.is_online = True
        user.last_seen = timezone.now()
        user.save(update_fields=['is_online', 'last_seen'])
        
        return user


