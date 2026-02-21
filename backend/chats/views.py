from rest_framework.decorators import api_view,permission_classes
from django.contrib.auth import get_user_model
from chats.serializers import UserGetSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

User=get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_list(request):
    try:
        user_obj=User.objects.exclude(id=request.user.id)
        serializer= UserGetSerializer(user_obj,many=True)
        return Response(serializer.data,status=200)
    except Exception as e:
        return Response({'error':str(e)},status=400)