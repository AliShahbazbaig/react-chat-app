from django.contrib import admin
from django.urls import path , include
from accounts.views import login,register_user
from chats import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/',register_user,name='register'),
    path('api/login/', login, name='login'),

    #Users
    path('api/user/', views.get_current_user, name='current-user'),
    path('api/users/',views.get_user_list,name='user-list'),
    path('api/users/search/',views.search_users,name='user-search'),

    # Chats
    path('api/my/conversations/',views.my_conversation_users,name='chat-list'),
    path('api/chats/',views.get_chats,name='chat-list'),
    path('api/chats/unread/',views.unread_count,name='unread-count'),

    # Conversation
    path('api/conversations/<int:user_id>/',views.get_or_create_conversation,name='get-or-create-conversation'),
    path('api/conversations/<int:conversation_id>/messages/',views.get_conversation_messages,name='conversation-messages'),
    path('api/conversations/<int:conversation_id>/read/',views.mark_conversation_read,name='mark-conversation-read'),

    # Meassages
    path('api/messages/<int:user_id>/send/',views.send_message,name='send-message'),
    path('api/messages/<int:message_id>/delete/',views.delete_message,name='delete-message'),

    # Group
    path("api/groups/create/",views.create_group,name='create-group'),
    path("api/group/<int:conversation_id>/add/",views.add_group_participants,name='add-group-participent'),
    path("api/group/<int:conversation_id>/remove/<int:user_id>/",views.remove_group_participant,name="remove-participent"),
    path("api/group/<int:conversaton_id>/delete/",views.delete_group,name="delete-group"),
    path("api/group/groups/",views.user_groups,name="user-group")


]