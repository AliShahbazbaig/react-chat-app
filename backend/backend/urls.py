from django.contrib import admin
from django.urls import path , include
from accounts.views import login,register_user,UserDetailView
from chats import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/',register_user,name='register'),
    path('api/login/', login, name='login'),
    path('api/profile/',UserDetailView.as_view(),name='profile'),
    path('api/profile/update/',UserDetailView.as_view(),name='update-profile'),
    path('api/profile/delete/',UserDetailView.as_view(),name='delete-profile'),
    

    #Users
    path('api/user/', views.get_current_user, name='current-user'),
    path('api/users/',views.get_user_list,name='user-list'),
    path('api/users/search/',views.search_users,name='user-search'),

    # Direct Chat
    path('api/my/conversations/',views.my_conversation_users,name='my-conversation'),
    path('api/chats/',views.get_chats,name='chat-list'),
    path('api/chats/unread/',views.unread_count,name='unread-count'),

    # Direct Conversation 
    path('api/conversations/<int:user_id>/',views.get_or_create_conversation,name='get-or-create-conversation'),
    path('api/conversations/<int:conversation_id>/messages/',views.get_conversation_messages_direct,name='conversation-messages'),
    path('api/conversations/<int:conversation_id>/read/',views.mark_conversation_read,name='mark-conversation-read'),

    # Direct Meassages
    path('api/messages/<int:user_id>/send/',views.send_message_direct,name='send-message'),
    path('api/messages/<int:message_id>/delete/',views.delete_message,name='delete-message'),

    # Group Management
    path("api/groups/create/",views.create_group,name='create-group'),
    path("api/groups/<int:conversation_id>/add/",views.add_group_participants,name='add-group-participant'),
    path("api/groups/<int:conversation_id>/remove/<int:user_id>/",views.remove_group_participant,name="remove-participant"),
    path("api/groups/<int:conversation_id>/delete/",views.delete_group,name="delete-group"),

    # My Groups
    path("api/groups/my/",views.user_groups,name="user-group"),

    # Group Messages
    path("api/groups/<int:conversation_id>/messages/",views.get_group_message,name='get-group-messages'),
    path("api/groups/<int:conversation_id>/send/",views.send_group_message,name='send-group-message'),
    path("api/groups/messages/<int:message_id>/delete/",views.delete_group_message,name='delete-group-message'),
    path('api/groups/<int:conversation_id>/read/',views.mark_group_read,name='mark-group-read')

]