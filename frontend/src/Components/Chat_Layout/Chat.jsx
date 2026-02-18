import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useParams } from "react-router-dom";
import Messages from "./Messages";
import Message_Input from "./Message_Input";

function Chat() {
  const { user, token, loading: authLoading } = useAuth();
  const { conversationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  
  const { 
    messages, 
    setMessages,  // Make sure this is exported from SocketContext
    currentConversation, 
    isConnected, 
    typingUsers,
    connect, 
    disconnect 
  } = useSocket();

  // Fetch existing messages from REST API
  const fetchMessages = async () => {
    if (!token || !conversationId) return;
    
    try {
      console.log('📥 Fetching messages for conversation:', conversationId);
      const response = await fetch(
        `http://localhost:8000/api/conversations/${conversationId}/messages/`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Fetched messages:', data);
      
      // Format messages to match WebSocket format
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        text: msg.text || msg.message,
        sender_id: msg.sender_id || msg.sender,
        sender_name: msg.sender_name,
        timestamp: msg.timestamp,
        is_read: msg.is_read || false,
        isSentByMe: (msg.sender_id || msg.sender) === user?.id
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation details
  const fetchConversationDetails = async () => {
    if (!token || !conversationId) return;
    
    try {
      const response = await fetch(
        `http://localhost:8000/api/conversations/${conversationId}/`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched conversation:', data);
        setOtherUser(data.other_user);
      }
    } catch (error) {
      console.error('❌ Error fetching conversation:', error);
    }
  };

  // Connect to WebSocket and fetch data when ready
  useEffect(() => {
    console.log('🔍 Chat mounted:', { authLoading, user: !!user, conversationId });
    
    if (!authLoading && user && conversationId) {
      console.log('🟢 Setting up chat for conversation:', conversationId);
      
      // Fetch existing messages and conversation details
      fetchMessages();
      fetchConversationDetails();
      
      // Connect WebSocket for real-time messages
      connect(conversationId);
    }

    return () => {
      if (user && conversationId) {
        console.log('🔵 Cleaning up chat');
        disconnect();
        setMessages([]); // Clear messages when leaving
      }
    };
  }, [conversationId, user, authLoading]);

  // Debug logs
  useEffect(() => {
    console.log('=== CHAT STATE ===');
    console.log('User:', user?.id);
    console.log('Is Connected:', isConnected);
    console.log('Messages count:', messages.length);
    console.log('Messages:', messages);
    console.log('Typing users:', typingUsers);
  }, [user, isConnected, messages, typingUsers]);

  // Show loading states
  if (authLoading || loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="mt-2 text-gray-500">Loading chat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p className="text-gray-500">Please log in to chat</p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  const displayUser = otherUser || currentConversation?.other_user;

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-white">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-4 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
            {displayUser?.first_name?.[0] || displayUser?.email?.[0] || '?'}
          </div>
          <div>
            <h2 className="font-semibold">
              {displayUser 
                ? `${displayUser.first_name || ''} ${displayUser.last_name || ''}`.trim() 
                : 'Chat'}
            </h2>
            <div className="flex items-center text-xs">
              <span className={`w-2 h-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-1`}></span>
              <span className="text-gray-500">
                {isConnected ? 'Online' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {typingUsers && Object.keys(typingUsers).length > 0 && (
            <span className="italic">
              {Object.values(typingUsers).join(', ')} 
              {Object.keys(typingUsers).length === 1 ? ' is' : ' are'} typing...
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <Messages messages={messages} currentUserId={user?.id} />

      {/* Input */}
      <Message_Input />
    </div>
  );
}

export default Chat;