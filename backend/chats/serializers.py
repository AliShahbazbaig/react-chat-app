from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PersonalMessage,Message,Conversation

class UserGetSerializer(serializers.ModelSerializer):
    class Meta:
        model= get_user_model()
        fields =['email', 'first_name','last_name','id']
        extra_kwargs = {
            'id':{'read_only':True}
        }

class PersonalMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    receiver_email = serializers.EmailField(source='receiver.email', read_only=True)
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = PersonalMessage
        fields = [
            'id', 'sender', 'sender_email', 'sender_name',
            'receiver', 'receiver_email', 'receiver_name',
            'message', 'timestamp', 'is_read'
        ]
        read_only_fields = ['id', 'timestamp', 'sender', 'sender_email', 'receiver_email', 'is_read']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.email
    
    def get_receiver_name(self, obj):
        return obj.receiver.get_full_name() or obj.receiver.email


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    class Meta:
        model = Message
        fields = ['id', 'sender_id', 'sender_name', 'text', 'is_read', 'timestamp']
        read_only_fields = ['id', 'timestamp', 'is_read']
    
    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.email

class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)
    participants = UserGetSerializer(many=True, read_only=True)  # Add this

    class Meta:
        model = Conversation
        fields = [
            'id',
            'other_user',
            'participants',  # Add participants here
            'last_message',
            'last_message_time',
            'unread_count_user1',
            'unread_count_user2',
            'messages',
            'created_at'
        ]

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        if obj.conversation_type == 'direct':
            if obj.user1 and obj.user2:
                if obj.user1.id == request.user.id:
                    other = obj.user2
                else:
                    other = obj.user1
                return UserGetSerializer(other).data
        return None

    def get_last_message(self, obj):
        if obj.last_message:
            return {
                'text': obj.last_message,
                'timestamp': obj.last_message_time,
                'sender_id': obj.last_message_sender.id if obj.last_message_sender else None,
                'sender_name': obj.last_message_sender.get_full_name() 
                               or obj.last_message_sender.email if obj.last_message_sender else 'Unknown'
            }
        return None

class ChatListSerializer(serializers.Serializer):
    """Simpler serializer for chat list view"""
    user = UserGetSerializer()
    last_message = serializers.CharField()
    last_message_time = serializers.DateTimeField()
    unread_count = serializers.IntegerField()
    conversation_id = serializers.IntegerField()