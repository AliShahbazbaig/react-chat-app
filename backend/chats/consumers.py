import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from .models import Conversation, Message, PersonalMessage

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        try:
            self.user = self.scope["user"]

            if not self.user or isinstance(self.user, AnonymousUser):
                logger.warning("Anonymous user attempted WebSocket connection")
                await self.close(code=4001)
                return

            self.conversation_id = int(
                self.scope["url_route"]["kwargs"]["conversation_id"]
            )

            self.room_group_name = f"chat_{self.conversation_id}"

            # Verify user belongs to conversation
            is_allowed = await self.is_user_allowed()
            if not is_allowed:
                logger.warning(f"User {self.user.id} not allowed in conversation {self.conversation_id}")
                await self.close(code=4003)
                return

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logger.info(f"User {self.user.id} connected to conversation {self.conversation_id}")
        except Exception as e:
            logger.error(f"Error in WebSocket connect: {str(e)}")
            await self.close(code=4000)


    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"User {self.user.id} disconnected from conversation {self.conversation_id}")
        except Exception as e:
            logger.error(f"Error in WebSocket disconnect: {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            logger.error("Invalid JSON received in WebSocket")
            await self.send(text_data=json.dumps({"error": "Invalid JSON format"}))
            return

        try:
            event_type = data.get("type")

            # Message Event
            if event_type == "new_message":
                message_text = data.get("message", "").strip()
                if not message_text:
                    return

                message_obj = await self.save_message(message_text)
                if not message_obj:
                    return

                # Get sender info
                sender_name = await self.get_sender_name()

                # message content may be in .text (Message) or .message (PersonalMessage)
                out_message = getattr(message_obj, 'text', None) or getattr(message_obj, 'message', '')
                out_timestamp = getattr(message_obj, 'timestamp', None)

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message_id": message_obj.id,
                        "message": out_message,
                        "sender_id": self.user.id,
                        "sender_name": sender_name,
                        "timestamp": str(out_timestamp),
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
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {str(e)}")
            await self.send(text_data=json.dumps({"error": "Error processing message"}))

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
            # Direct conversation: user1 or user2
            if conversation.conversation_type == 'direct':
                return self.user in [conversation.user1, conversation.user2]
            # Group conversation: check participants
            if conversation.conversation_type == 'group':
                return conversation.participants.filter(id=self.user.id).exists()
            return False
        except Conversation.DoesNotExist:
            logger.warning(f"Conversation {self.conversation_id} not found")
            return False
        except Exception as e:
            logger.error(f"Error checking user access: {str(e)}")
            return False

    @sync_to_async
    def save_message(self, message_text):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)

            # For direct conversations, use PersonalMessage model
            if conversation.conversation_type == 'direct':
                # determine receiver
                receiver = conversation.user2 if self.user == conversation.user1 else conversation.user1
                message = PersonalMessage.objects.create(
                    sender=self.user,
                    receiver=receiver,
                    message=message_text
                )

                # Update conversation metadata and unread counts
                conversation.last_message = message_text
                conversation.last_message_time = message.timestamp
                conversation.last_message_sender = self.user
                conversation.increment_unread_for_receiver(self.user)
                conversation.save()
                return message

            # Group message
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                text=message_text
            )

            # Update conversation metadata and unread counts for group
            conversation.last_message = message_text
            conversation.last_message_time = message.timestamp
            conversation.last_message_sender = self.user
            conversation.increment_group_unread_for_all(self.user)
            conversation.save()

            return message
        except Conversation.DoesNotExist:
            logger.error(f"Conversation {self.conversation_id} not found when saving message")
            return None
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            return None

    @sync_to_async
    def mark_messages_read(self, message_ids):
        try:
            # Mark messages as read for the appropriate model depending on conversation type
            conversation = Conversation.objects.get(id=self.conversation_id)

            if conversation.conversation_type == 'direct':
                # Direct messages are PersonalMessage instances
                messages = PersonalMessage.objects.filter(
                    id__in=message_ids,
                    receiver=self.user
                )
                updated = messages.exclude(is_read=True).update(is_read=True)

                # Reset unread count for this user
                if self.user == conversation.user1:
                    conversation.unread_count_user1 = 0
                elif self.user == conversation.user2:
                    conversation.unread_count_user2 = 0
                conversation.save()
                return updated

            # Group messages: add to read_by M2M and set is_read for backward compatibility
            messages = Message.objects.filter(id__in=message_ids, conversation=conversation).exclude(sender=self.user)
            for message in messages:
                message.read_by.add(self.user)
                if not message.is_read:
                    message.is_read = True
                    message.save()

            # Reset group unread for this participant
            conversation.reset_group_unread_for_user(self.user)
            return messages.count()
        except Conversation.DoesNotExist:
            logger.error(f"Conversation {self.conversation_id} not found when marking messages as read")
            return 0
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")
            return 0