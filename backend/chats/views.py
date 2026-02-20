from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from .models import Conversation, Message, PersonalMessage
from .serializers import (
    UserGetSerializer,
    MessageSerializer,
    ConversationSerializer,
    ConversationListSerializer
    ,PersonalMessageSerializer
)

User = get_user_model()



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserGetSerializer(request.user)
    return Response(serializer.data)

# --------------------------------------------------
# Get All Users (Except Current)
# --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_list(request):
    users = User.objects.exclude(id=request.user.id)

    paginator =PageNumberPagination()
    paginator.page_size=10

    result_page= paginator.paginate_queryset(users,request)
    serializer = UserGetSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)



# --------------------------------------------------
# Search Users
# --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    search_term = request.query_params.get('q', '').strip()

    if not search_term:
        return Response([], status=status.HTTP_200_OK)

    users = User.objects.filter(
        Q(email__icontains=search_term) |
        Q(first_name__icontains=search_term) |
        Q(last_name__icontains=search_term)
    ).exclude(id=request.user.id)[:10]

    serializer = UserGetSerializer(users, many=True)
    return Response(serializer.data)


# --------------------------------------------------
# Direct Chat Views
# --------------------------------------------------

# --------------------------------------------------
# Get All Users WITH CONVERSATION
# --------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_conversation_users(request):
    user=request.user
    conversations = Conversation.objects.filter(
        conversation_type='direct'
    ).filter(Q(user1=user) | Q(user2=user)).select_related(
        'user1','user2',"last_message_sender"
    ).order_by('-last_message_time')

    serializer= ConversationListSerializer(conversations,many=True,context={
        'request':request
    })

    return Response(serializer.data)


# --------------------------------------------------
# Get Chat List
# --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chats(request):

    conversations = Conversation.objects.filter(
        Q(user1=request.user) | Q(user2=request.user)
    ).select_related('user1', 'user2').order_by('-last_message_time')

    data = []

    for convo in conversations:
        other_user = (
            convo.user2 if convo.user1 == request.user
            else convo.user1
        )

        unread_count = (
            convo.unread_count_user1
            if convo.user1 == request.user
            else convo.unread_count_user2
        )

        data.append({
            "conversation_id": convo.id,
            "user": UserGetSerializer(other_user).data,
            "last_message": convo.last_message,
            "last_message_time": convo.last_message_time,
            "unread_count": unread_count
        })

    return Response(data)


# --------------------------------------------------
# Get or Create Conversation
# --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_or_create_conversation(request, user_id):
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Don't allow conversation with self
    if other_user.id == request.user.id:
        return Response(
            {"error": "Cannot create conversation with yourself"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Use the model method to get or create
    conversation, created = Conversation.get_or_create_direct(request.user, other_user)


    return Response({
        "conversation_id": conversation.id,
        "created": created,
        }
    )


# --------------------------------------------------
# Get Messages in Conversation
# --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages_direct(request, conversation_id):

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=404)

    # Access check
    if conversation.conversation_type != 'direct':
        return Response({"error": "Not a direct conversation"}, status=400)

    if request.user not in [conversation.user1, conversation.user2]:
        return Response({"error": "Permission denied"}, status=403)


    # For direct conversations we store messages in PersonalMessage
    messages = PersonalMessage.objects.filter(
        (Q(sender=conversation.user1) & Q(receiver=conversation.user2)) |
        (Q(sender=conversation.user2) & Q(receiver=conversation.user1))
    ).order_by('timestamp')

    serializer = PersonalMessageSerializer(messages, many=True)
    return Response(serializer.data)


# --------------------------------------------------
# Send Message
# --------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def send_message_direct(request, user_id):
    try:
        receiver = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Don't allow sending messages to self
    if receiver.id == request.user.id:
        return Response(
            {"error": "Cannot send message to yourself"},
            status=status.HTTP_400_BAD_REQUEST
        )

    message_text = request.data.get('message', '').strip()
    if not message_text:
        return Response(
            {"error": "Message cannot be empty"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get or create conversation (keeps conversation metadata)
    conversation, _ = Conversation.get_or_create_direct(request.user, receiver)

    # Create personal (direct) message
    message = PersonalMessage.objects.create(
        sender=request.user,
        receiver=receiver,
        message=message_text
    )

    # Update conversation metadata to reflect last message
    conversation.last_message = message_text
    conversation.last_message_time = message.timestamp
    conversation.last_message_sender = request.user
    conversation.increment_unread_for_receiver(request.user)
    conversation.save()

    serializer = PersonalMessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# --------------------------------------------------
# Mark Conversation Read
# --------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_conversation_read(request, conversation_id):

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user not in [conversation.user1, conversation.user2]:
        return Response(
            {"error": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    other_user = (
        conversation.user2
        if request.user == conversation.user1
        else conversation.user1
    )

    # Mark PersonalMessage instances between the two users as read
    updated = PersonalMessage.objects.filter(
        sender=other_user,
        receiver=request.user,
        is_read=False
    ).update(is_read=True)

    if request.user == conversation.user1:
        conversation.unread_count_user1 = 0
    else:
        conversation.unread_count_user2 = 0

    conversation.save()

    return Response({"marked_read": updated})


# --------------------------------------------------
# Total Unread Count
# --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):

    conversations = Conversation.objects.filter(
        Q(user1=request.user) | Q(user2=request.user)
    )

    total_unread = 0

    for convo in conversations:
        if convo.user1 == request.user:
            total_unread += convo.unread_count_user1
        else:
            total_unread += convo.unread_count_user2

    return Response({"unread_count": total_unread})


# --------------------------------------------------
# Delete Message
# --------------------------------------------------

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    try:
        message = PersonalMessage.objects.get(
            id=message_id,
            sender=request.user
        )
    except PersonalMessage.DoesNotExist:
        return Response({"error": "Message not found or permission denied"}, status=status.HTTP_404_NOT_FOUND)

    message.delete()
    return Response({"message": "Message deleted"}, status=status.HTTP_200_OK)



# --------------------------------------------------
# Group Create
# --------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group(request):
    name = request.data.get('name', '').strip()
    participant_ids = request.data.get('participants', [])

    if not name:
        return Response({"error": "Group name required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check if a group with this name already exists
    if Conversation.objects.filter(name=name, conversation_type='group').exists():
        return Response({"error": "A group with this name already exists"}, status=status.HTTP_400_BAD_REQUEST)

    if not participant_ids or len(participant_ids) < 2:
        return Response({"error": "At least 2 participants required"}, status=status.HTTP_400_BAD_REQUEST)

    # Add creator to participants if not already included
    if request.user.id not in participant_ids:
        participant_ids.append(request.user.id)

    # Get unique participant users
    participants = User.objects.filter(id__in=set(participant_ids))

    if participants.count() != len(set(participant_ids)):
        return Response({"error": "Some users not found"}, status=status.HTTP_404_NOT_FOUND)

    # Create group conversation
    conversation = Conversation.objects.create(
        name=name,
        conversation_type='group',
        created_by=request.user
    )

    # Add all participants
    conversation.participants.set(participants)
    conversation.save()

    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# --------------------------------------------------
# Add users to Group 
# --------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_group_participants(request, conversation_id):
    try:
        conversation = Conversation.objects.get(
            id=conversation_id, 
            conversation_type='group'
        )
    except Conversation.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is group creator or has permission
    if conversation.created_by != request.user:
        return Response({"error": "Only group creator can add participants"}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    participant_ids = request.data.get('participants', [])
    if not participant_ids:
        return Response({"error": "No participants specified"}, status=status.HTTP_400_BAD_REQUEST)
    
    new_participants = User.objects.filter(id__in=participant_ids)
    conversation.participants.add(*new_participants)
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data)


# --------------------------------------------------
# Remove Group participants
# --------------------------------------------------

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_group_participant(request, conversation_id, user_id):
    """Remove a user from a group chat"""
    try:
        conversation = Conversation.objects.get(
            id=conversation_id, 
            conversation_type='group'
        )
    except Conversation.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permissions
    if conversation.created_by != request.user and request.user.id != user_id:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user_to_remove = User.objects.get(id=user_id)
        conversation.participants.remove(user_to_remove)
        return Response({"message": "User removed from group"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    

# --------------------------------------------------
# Delete Group
# --------------------------------------------------

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_group(request,conversation_id):
    try:
        group= Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({"error":"Group not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if group.created_by !=request.user:
        return Response({"error":"Only the Group creator can delete this group"},status=status.HTTP_403_FORBIDDEN)
    
    group.delete()
    return Response({"message":"Group Has been deleted"},status=status.HTTP_200_OK)


# --------------------------------------------------
# Get User's Groups
# --------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_groups(request):
    groups = Conversation.objects.filter(
        conversation_type='group',
        participants=request.user
    ).order_by('-last_message_time')

    data = []

    for group in groups:

        unread = group.get_group_unread_count(request.user)

        data.append({
            "conversation_id": group.id,
            "name": group.name,
            "last_message": group.last_message,
            "last_message_time": group.last_message_time,
            "unread_count": unread
        })

    return Response(data)

# --------------------------------------------------
# Send Group Message
# --------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def send_group_message(request,conversation_id):
        
    conversation = get_object_or_404(
        Conversation,
        id=conversation_id,
        conversation_type='group'
    )
    
    if request.user not in conversation.participants.all():
        return Response({"error":"Not a group member"},status=403)
    
    text = request.data.get("message","").strip()

    if not text:
        return Response({"error":"Message cant be empty"},status=400)

    message= Message.objects.create(
        conversation=conversation,
        sender=request.user,
        text=text
    )

    conversation.last_message=text
    conversation.last_message_time=message.timestamp
    conversation.last_message_sender=request.user

    conversation.increment_group_unread_for_all(request.user)
    conversation.save()

    serializer=MessageSerializer(message)
    return Response(serializer.data,status=201)

# --------------------------------------------------
# Get All Message in group
# --------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_group_message(request,conversation_id):
    conversation = get_object_or_404(
        Conversation,
        id=conversation_id,
        conversation_type='group'
    )
    if request.user not in conversation.participants.all():
        return Response({"error":"Not a group member"},status=403)
    
    messages=conversation.messages.order_by('timestamp')

    serializer=MessageSerializer(messages,many=True)
    return Response(serializer.data)

# --------------------------------------------------
#  Delete Message in a group
# --------------------------------------------------

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_group_message(request,message_id):
    try:
        message=Message.objects.get(
            id= message_id,
            sender=request.user,
            conversation__conversation_type='group'
        )
    except Message.DoesNotExist:
        return Response({"error":"Message not found or permision denied"},status=404)

    message.delete()    

    return Response({"message":"Message deleted"},status=200)


# --------------------------------------------------
# Mark as read in group
# --------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_group_read(request,conversation_id):
    try:
        conversation=Conversation.objects.get(
            id=conversation_id,
            conversation_type='group'
        )
    except Conversation.DoesNotExist:
        return Response({"error":"Group Not found"},status=404)
    
    if request.user not in conversation.participants.all():
        return Response({"error": "Not a group member"}, status=403)

    conversation.reset_group_unread_for_user(request.user)

    return Response({"message":"marked as read"})