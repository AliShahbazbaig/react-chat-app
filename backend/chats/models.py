from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Q,F
from django.utils import timezone

User = get_user_model()

# For SIMPLE direct messaging (no conversation overhead)
class PersonalMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']
        indexes=[
            models.Index(fields=['sender','receiver']),
            models.Index(fields=['timestamp'])
        ]
    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.message[:20]}"
    





class Conversation(models.Model):
    CONVERSATION_TYPES = [
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
    ]
    
    # For direct messages - both fields are required
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, null=True,blank=True,related_name="conversations_as_user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True,blank=True,related_name="conversations_as_user2")
    
    # For group chats
    name = models.CharField(max_length=255, blank=True, null=True)
    conversation_type = models.CharField(max_length=10, choices=CONVERSATION_TYPES, default='direct')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,blank=True, related_name="created_groups")
    participants = models.ManyToManyField(User, related_name='group_conversations', blank=True)

    # Metadata
    last_message = models.TextField(blank=True, null=True)
    last_message_time = models.DateTimeField(blank=True, null=True)
    last_message_sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="+")

    # Unread counts(direct only)
    unread_count_user1 = models.PositiveIntegerField(default=0)
    unread_count_user2 = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user1","user2"],
                condition=Q(conversation_type='direct'),
                name='unique_direct_conversation'
            ),
        
            models.UniqueConstraint(
                fields=['name'], 
                condition=models.Q(conversation_type='group'), 
                name='unique_group_name')
        ]
        indexes = [
            models.Index(fields=['user1', 'user2']),
            models.Index(fields=['last_message_time']),
        ]

    # For direct conversation
    def save(self, *args, **kwargs):
        if self.conversation_type == 'direct':
            if self.user1 and self.user2 and self.user1.id > self.user2.id:
                self.user1, self.user2 = self.user2, self.user1
        super().save(*args, **kwargs)

    @classmethod
    def get_or_create_direct(cls, user_a, user_b):
        user1, user2 = sorted([user_a, user_b], key=lambda u: u.id)

        conversation, created = cls.objects.get_or_create(
            user1=user1,
            user2=user2,
            conversation_type='direct',
            defaults={
                'conversation_type': 'direct'
            }
        )
        return conversation, created

    def get_other_user(self, user):
        if self.conversation_type != 'direct':
            return None
        return self.user2 if user == self.user1 else self.user1

    def get_unread_count_for_user(self, user):
        if user == self.user1:
            return self.unread_count_user1
        elif user == self.user2:
            return self.unread_count_user2
        return 0

    def increment_unread_for_receiver(self, sender):
        if sender == self.user1:
            self.unread_count_user2 += 1
        elif sender == self.user2:
            self.unread_count_user1 += 1
        self.save()

    def reset_unread_for_user(self, user):
        """Reset unread count for a user"""
        if user == self.user1:
            self.unread_count_user1 = 0
        elif user == self.user2:
            self.unread_count_user2 = 0
        self.save()

    def __str__(self):
        if self.conversation_type == 'direct':
            return f"DM: {self.user1.email} ↔ {self.user2.email}"
        return f"Group: {self.name or 'Unnamed'}"

    #group
    def get_group_unread_count(self,user):
        if self.conversation_type!="group":
            return 0
        try:
            participant= self.group_participants.get(user=user)
            return participant.unread_count
        except GroupParticipant.DoesNotExist:
            return 0
        
    def increment_group_unread_for_all(self,sender):
        if self.conversation_type!='group':
            return
        self.group_participants.exclude(user=sender).update(unread_count=F('unread_count')+1)

    def reset_group_unread_for_user(self,user):
        if self.conversation_type!='group':
            return
        try:
            participant=self.group_participants.get(user=user)
            participant.unread_count=0
            participant.last_read=timezone.now()
            participant.save()
        except GroupParticipant.DoesNotExist:
            pass
class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['conversation', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.sender.email}: {self.text[:50]}"
    
class GroupParticipant(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="group_participants"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unread_count = models.PositiveIntegerField(default=0)
    last_read = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('conversation', 'user')

    def __str__(self):
        return f"{self.user.email} in {self.conversation.name or 'Unnamed Group'}"

