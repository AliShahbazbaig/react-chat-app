from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from accounts.tokenauthentication import JWTAuthentication
from .serializers import LoginSerializer,UserSerializer
from rest_framework.permissions import AllowAny


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
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



