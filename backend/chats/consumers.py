import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]

        if not self.user or isinstance(self.user, AnonymousUser):
            await self.close()
            return

        self.conversation_id = int(
            self.scope["url_route"]["kwargs"]["conversation_id"]
        )

        self.room_group_name = f"chat_{self.conversation_id}"

        # Verify user belongs to conversation
        is_allowed = await self.is_user_allowed()
        if not is_allowed:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get("type")

        # Message Event
        if event_type == "new_message":
            message_text = data.get("message", "").strip()
            if not message_text:
                return

            message_obj = await self.save_message(message_text)

            # Get sender info
            sender_name = await self.get_sender_name()

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message_id": message_obj.id,
                    "message": message_obj.text,
                    "sender_id": self.user.id,
                    "sender_name": sender_name,
                    "timestamp": str(message_obj.timestamp),
                    "conversation_id": self.conversation_id
                }
            )

        # Typing Start
        elif event_type == "typing_start":
            sender_name = await self.get_sender_name()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_event",
                    "status": "start",
                    "user_id": self.user.id,
                    "user_name": sender_name
                }
            )

        # Typing Stop
        elif event_type == "typing_stop":
            sender_name = await self.get_sender_name()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_event",
                    "status": "stop",
                    "user_id": self.user.id,
                    "user_name": sender_name
                }
            )

        # Mark as read
        elif event_type == "mark_read":
            message_ids = data.get("message_ids", [])
            if message_ids:
                await self.mark_messages_read(message_ids)
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "read_receipt",
                        "message_ids": message_ids,
                        "reader_id": self.user.id,
                        "reader_name": await self.get_sender_name()
                    }
                )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "id": event["message_id"],
            "message": event["message"],
            "sender_id": event["sender_id"],
            "sender_name": event["sender_name"],
            "timestamp": event["timestamp"],
            "conversation_id": event["conversation_id"]
        }))

    async def typing_event(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "status": event["status"],
            "user_id": event["user_id"],
            "user_name": event["user_name"]
        }))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            "type": "messages_read",
            "message_ids": event["message_ids"],
            "reader_id": event["reader_id"],
            "reader_name": event["reader_name"]
        }))

    # Database operations
    @sync_to_async
    def get_sender_name(self):
        return self.user.get_full_name() or self.user.email

    @sync_to_async
    def is_user_allowed(self):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            # Check if user is part of this direct conversation
            return self.user in [conversation.user1, conversation.user2]
        except Conversation.DoesNotExist:
            return False

    @sync_to_async
    def save_message(self, message_text):
        conversation = Conversation.objects.get(id=self.conversation_id)

        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            text=message_text
        )

        # Update conversation metadata
        conversation.last_message = message_text
        conversation.last_message_time = message.timestamp
        conversation.last_message_sender = self.user
        conversation.save()

        return message

    @sync_to_async
    def mark_messages_read(self, message_ids):
        # Mark messages as read by this user
        messages = Message.objects.filter(
            id__in=message_ids,
            conversation_id=self.conversation_id
        ).exclude(sender=self.user)
        
        for message in messages:
            message.read_by.add(self.user)
            # Also set is_read=True for backward compatibility
            if not message.is_read:
                message.is_read = True
                message.save()